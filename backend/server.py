from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import json
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "weddingcard")

# MongoDB client and database
mongodb_client = None
database = None

async def connect_to_mongo():
    global mongodb_client, database
    try:
        print(f"🔄 Attempting to connect to MongoDB: {MONGO_URL}")
        mongodb_client = AsyncIOMotorClient(MONGO_URL)
        database = mongodb_client[DB_NAME]
        # Test the connection
        await database.command("ping")
        print(f"✅ Connected to MongoDB database: {DB_NAME}")
        logger.info(f"✅ Connected to MongoDB database: {DB_NAME}")
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        logger.error(f"❌ Error connecting to MongoDB: {e}")
        # Don't raise the error, just continue with JSON files
        pass

async def close_mongo_connection():
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()

# JSON file for simple user storage (backup)
USERS_FILE = ROOT_DIR / 'users.json'
WEDDINGS_FILE = ROOT_DIR / 'weddings.json'

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# MongoDB collections
users_collection = None
weddings_collection = None

async def get_collections():
    global users_collection, weddings_collection
    if users_collection is None:
        users_collection = database.users
    if weddings_collection is None:
        weddings_collection = database.weddings
    return users_collection, weddings_collection

# Simple session storage (in production, use Redis or similar)
active_sessions = {}

# Models
class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password: str  # Simple plain text password
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RSVPResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wedding_id: str
    guest_name: str
    guest_email: str
    guest_phone: Optional[str] = ""
    attendance: str  # "yes" or "no"
    guest_count: int = 1
    dietary_restrictions: Optional[str] = ""
    special_message: Optional[str] = ""
    submitted_at: datetime = Field(default_factory=datetime.utcnow)

class WeddingData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    couple_name_1: str
    couple_name_2: str
    wedding_date: str
    venue_name: str
    venue_location: str
    their_story: str
    story_timeline: List[dict] = []
    schedule_events: List[dict] = []
    gallery_photos: List[dict] = []
    bridal_party: List[dict] = []
    groom_party: List[dict] = []
    special_roles: List[dict] = []  # Added special roles field
    registry_items: List[dict] = []
    honeymoon_fund: dict = {}
    faqs: List[dict] = []
    theme: str = "classic"
    rsvp_responses: List[dict] = []  # Store RSVP responses
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WeddingDataCreate(BaseModel):
    couple_name_1: str
    couple_name_2: str
    wedding_date: str
    venue_name: str
    venue_location: str
    their_story: str
    story_timeline: List[dict] = []
    schedule_events: List[dict] = []
    gallery_photos: List[dict] = []
    bridal_party: List[dict] = []
    groom_party: List[dict] = []
    special_roles: List[dict] = []  # Added special roles field
    registry_items: List[dict] = []
    honeymoon_fund: dict = {}
    faqs: List[dict] = []
    theme: str = "classic"

class AuthResponse(BaseModel):
    session_id: str
    user_id: str
    username: str
    success: bool

# Simple file operations
def load_json_file(filename):
    if not filename.exists():
        return {}
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_json_file(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2, default=str)

# MongoDB-based authentication helper functions
async def create_simple_session(user_id: str) -> str:
    session_id = str(uuid.uuid4())
    session_data = {
        "session_id": session_id,
        "user_id": user_id,
        "created_at": datetime.utcnow()
    }
    
    # Store in memory for fast access
    active_sessions[session_id] = session_data
    
    # Also store in MongoDB for persistence across server restarts
    users_coll, weddings_coll = await get_collections()
    if users_coll is not None:
        try:
            sessions_collection = database.sessions
            await sessions_collection.insert_one(session_data)
            print(f"✅ Session {session_id} stored in MongoDB")
        except Exception as e:
            print(f"⚠️ Failed to store session in MongoDB: {e}")
    
    return session_id

async def get_current_user_simple(session_id: str = None):
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session ID required"
        )
    
    # First check in-memory sessions
    session = active_sessions.get(session_id)
    
    # If not in memory, check MongoDB
    if not session:
        try:
            users_coll, weddings_coll = await get_collections()
            if users_coll is not None:
                sessions_collection = database.sessions
                session_data = await sessions_collection.find_one({"session_id": session_id})
                if session_data:
                    # Restore to memory cache
                    active_sessions[session_id] = session_data
                    session = session_data
                    print(f"✅ Session {session_id} restored from MongoDB")
        except Exception as e:
            print(f"⚠️ Failed to restore session from MongoDB: {e}")
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session"
        )
    
    users_coll, weddings_coll = await get_collections()
    user_data = await users_coll.find_one({"id": session["user_id"]})
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return User(**user_data)

# Auth Routes - MongoDB-based
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserRegister):
    users_coll, weddings_coll = await get_collections()
    
    # Check if user already exists
    existing_user = await users_coll.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user with plain text password
    user = User(
        username=user_data.username,
        password=user_data.password  # Store plain text password (simple approach)
    )
    
    # Save to MongoDB
    user_dict = user.dict()
    await users_coll.insert_one(user_dict)
    
    # Also save to JSON as backup
    users = load_json_file(USERS_FILE)
    users[user.id] = user_dict
    save_json_file(USERS_FILE, users)
    
    # Create default wedding data for new user with auto-generated shareable ID
    shareable_id = str(uuid.uuid4())[:8]  # Short 8-character shareable ID
    
    default_wedding_data = WeddingData(
        user_id=user.id,
        couple_name_1="Sarah",
        couple_name_2="Michael",
        wedding_date="2025-06-15",
        venue_name="Sunset Garden Estate",
        venue_location="Sunset Garden Estate • Napa Valley, California",
        their_story="We can't wait to celebrate our love story with the people who matter most to us. Join us for an unforgettable evening of joy, laughter, and new beginnings.",
        story_timeline=[
            {
                "year": "2019",
                "title": "First Meeting",
                "description": "We met at a coffee shop in downtown San Francisco on a rainy Tuesday morning.",
                "image": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=400&fit=crop"
            }
        ],
        schedule_events=[
            {
                "time": "2:00 PM",
                "title": "Guests Arrival & Welcome",
                "description": "Please arrive by 2:00 PM for welcome drinks and mingling.",
                "location": "Sunset Garden Estate - Main Entrance",
                "duration": "30 minutes",
                "highlight": False
            }
        ],
        gallery_photos=[],
        bridal_party=[],
        groom_party=[],
        special_roles=[],
        registry_items=[],
        honeymoon_fund={},
        faqs=[],
        theme="classic"
    )
    
    # Save wedding data to MongoDB
    wedding_dict = default_wedding_data.dict()
    wedding_dict["shareable_id"] = shareable_id  # Add shareable ID
    wedding_dict["created_at"] = wedding_dict["created_at"].isoformat()
    wedding_dict["updated_at"] = wedding_dict["updated_at"].isoformat()
    
    await weddings_coll.insert_one(wedding_dict)
    
    # Also save to JSON as backup
    weddings = load_json_file(WEDDINGS_FILE)
    weddings[default_wedding_data.id] = wedding_dict
    save_json_file(WEDDINGS_FILE, weddings)
    
    # Create simple session
    session_id = await create_simple_session(user.id)
    
    return AuthResponse(
        session_id=session_id,
        user_id=user.id,
        username=user.username,
        success=True
    )

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(user_data: UserLogin):
    users_coll, weddings_coll = await get_collections()
    
    # Simple string comparison authentication
    user_found = await users_coll.find_one({
        "username": user_data.username,
        "password": user_data.password
    })
    
    if not user_found:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Create simple session
    session_id = await create_simple_session(user_found["id"])
    
    return AuthResponse(
        session_id=session_id,
        user_id=user_found["id"],
        username=user_found["username"],
        success=True
    )

# MongoDB-based Wedding Data Routes
@api_router.post("/wedding")
async def create_wedding_data(request_data: dict):
    session_id = request_data.get('session_id')
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session ID required"
        )
    
    current_user = await get_current_user_simple(session_id)
    users_coll, weddings_coll = await get_collections()
    
    # Check if user already has wedding data
    existing_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    if existing_wedding:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a wedding card. Use update endpoint instead."
        )
    
    # Remove session_id from the data before creating wedding
    wedding_create_data = {k: v for k, v in request_data.items() if k != 'session_id'}
    
    # Generate shareable link ID automatically (shorter and user-friendly)
    shareable_id = str(uuid.uuid4())[:8]  # Short 8-character ID
    
    wedding = WeddingData(
        user_id=current_user.id,
        **wedding_create_data
    )
    
    # Convert to dict and handle ObjectId
    wedding_dict = wedding.dict()
    wedding_dict["shareable_id"] = shareable_id  # Add shareable ID
    wedding_dict["created_at"] = wedding_dict["created_at"].isoformat()
    wedding_dict["updated_at"] = wedding_dict["updated_at"].isoformat()
    
    # Save to MongoDB
    result = await weddings_coll.insert_one(wedding_dict)
    wedding_dict["_id"] = str(result.inserted_id)
    
    # Also save to JSON as backup
    weddings = load_json_file(WEDDINGS_FILE)
    weddings[wedding.id] = wedding_dict
    save_json_file(WEDDINGS_FILE, weddings)
    
    # Remove _id from response
    response_data = {k: v for k, v in wedding_dict.items() if k != "_id"}
    return response_data

@api_router.put("/wedding")
async def update_wedding_data(request_data: dict):
    session_id = request_data.get('session_id')
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session ID required"
        )
    
    current_user = await get_current_user_simple(session_id)
    users_coll, weddings_coll = await get_collections()
    
    # Find existing wedding
    existing_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    if not existing_wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding data not found"
        )
    
    # Remove session_id from the data before updating
    updated_data = {k: v for k, v in request_data.items() if k != 'session_id'}
    updated_data["updated_at"] = datetime.utcnow().isoformat()
    updated_data["user_id"] = current_user.id
    updated_data["id"] = existing_wedding["id"]
    
    # Preserve shareable_id if it exists
    if "shareable_id" in existing_wedding:
        updated_data["shareable_id"] = existing_wedding["shareable_id"]
    
    # Preserve created_at timestamp
    if "created_at" in existing_wedding:
        updated_data["created_at"] = existing_wedding["created_at"]
    
    # Update in MongoDB
    await weddings_coll.update_one(
        {"user_id": current_user.id},
        {"$set": updated_data}
    )
    
    # Also update JSON backup
    weddings = load_json_file(WEDDINGS_FILE)
    weddings[existing_wedding["id"]] = updated_data
    save_json_file(WEDDINGS_FILE, weddings)
    
    return updated_data

@api_router.get("/wedding")
async def get_wedding_data(session_id: str):
    current_user = await get_current_user_simple(session_id)
    users_coll, weddings_coll = await get_collections()
    
    wedding_data = await weddings_coll.find_one({"user_id": current_user.id})
    if not wedding_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding data not found"
        )
    
    # Remove _id from response
    response_data = {k: v for k, v in wedding_data.items() if k != "_id"}
    return response_data

@api_router.get("/wedding/public/{wedding_id}")
async def get_public_wedding_data(wedding_id: str):
    users_coll, weddings_coll = await get_collections()
    
    # Try MongoDB first
    wedding = await weddings_coll.find_one({"id": wedding_id})
    
    if not wedding:
        # Fallback to JSON file
        weddings = load_json_file(WEDDINGS_FILE)
        if wedding_id not in weddings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wedding not found"
            )
        wedding = weddings[wedding_id]
    
    # Remove sensitive data for public access
    public_data = {k: v for k, v in wedding.items() if k not in ["user_id", "_id"]}
    return public_data

# Add shareable link endpoint 
@api_router.get("/wedding/share/{shareable_id}")
async def get_wedding_by_shareable_id(shareable_id: str):
    users_coll, weddings_coll = await get_collections()
    
    # Search for wedding by shareable_id ONLY (8-character system)
    wedding = await weddings_coll.find_one({"shareable_id": shareable_id})
    
    if wedding:
        # Remove sensitive data for public access
        public_data = {k: v for k, v in wedding.items() if k not in ["user_id", "_id"]}
        return public_data
    
    # Fallback to JSON file for shareable_id ONLY
    weddings = load_json_file(WEDDINGS_FILE)
    for wedding_id, wedding_data in weddings.items():
        # Check ONLY shareable_id (no more custom_url support)
        if wedding_data.get("shareable_id") == shareable_id:
            # Remove sensitive data for public access
            public_data = {k: v for k, v in wedding_data.items() if k not in ["user_id"]}
            return public_data
    
    # If not found by shareable ID, return enhanced default data
    enhanced_default_data = {
        "id": "default",
        "shareable_id": shareable_id,
        "couple_name_1": "Sarah",
        "couple_name_2": "Michael",
        "wedding_date": "2025-06-15",
        "venue_name": "Sunset Garden Estate",
        "venue_location": "Sunset Garden Estate • Napa Valley, California",
        "their_story": "We can't wait to celebrate our love story with the people who matter most to us. Join us for an unforgettable evening of joy, laughter, and new beginnings.",
        "story_timeline": [
            {
                "year": "2019",
                "title": "First Meeting",
                "description": "We met at a coffee shop in downtown San Francisco on a rainy Tuesday morning.",
                "image": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=400&fit=crop"
            }
        ],
        "schedule_events": [
            {
                "time": "2:00 PM",
                "title": "Guests Arrival & Welcome",
                "description": "Please arrive by 2:00 PM for welcome drinks and mingling.",
                "location": "Sunset Garden Estate - Main Entrance",
                "duration": "30 minutes",
                "highlight": False
            }
        ],
        "gallery_photos": [],
        "bridal_party": [],
        "groom_party": [],
        "special_roles": [],
        "registry_items": [],
        "honeymoon_fund": {},
        "faqs": [],
        "theme": "classic"
    }
    
    return enhanced_default_data

# Get user profile - MongoDB version
@api_router.get("/profile")
async def get_profile(session_id: str):
    current_user = await get_current_user_simple(session_id)
    return {
        "id": current_user.id,
        "username": current_user.username,
        "created_at": current_user.created_at
    }

# RSVP Endpoints
@api_router.post("/rsvp")
async def submit_rsvp(rsvp_data: dict):
    users_coll, weddings_coll = await get_collections()
    
    # Create RSVP response
    rsvp_response = RSVPResponse(
        wedding_id=rsvp_data.get('wedding_id', ''),
        guest_name=rsvp_data.get('guest_name', ''),
        guest_email=rsvp_data.get('guest_email', ''),
        guest_phone=rsvp_data.get('guest_phone', ''),
        attendance=rsvp_data.get('attendance', ''),
        guest_count=int(rsvp_data.get('guest_count', 1)),
        dietary_restrictions=rsvp_data.get('dietary_restrictions', ''),
        special_message=rsvp_data.get('special_message', '')
    )
    
    # Convert to dict
    rsvp_dict = rsvp_response.dict()
    rsvp_dict["submitted_at"] = rsvp_dict["submitted_at"].isoformat()
    
    # Store RSVP in separate collection
    rsvps_collection = database.rsvps
    await rsvps_collection.insert_one(rsvp_dict)
    
    return {"success": True, "message": "RSVP submitted successfully", "rsvp_id": rsvp_response.id}

@api_router.get("/rsvp/{wedding_id}")
async def get_wedding_rsvps(wedding_id: str):
    """Get all RSVPs for a specific wedding (for admin/couple view)"""
    users_coll, weddings_coll = await get_collections()
    
    # Get RSVPs for this wedding
    rsvps_collection = database.rsvps
    rsvps = await rsvps_collection.find({"wedding_id": wedding_id}).to_list(length=None)
    
    # Remove _id from response and format dates
    response_data = []
    for rsvp in rsvps:
        clean_rsvp = {k: v for k, v in rsvp.items() if k != "_id"}
        response_data.append(clean_rsvp)
    
    return {"success": True, "rsvps": response_data, "total_count": len(response_data)}

@api_router.get("/rsvp/shareable/{shareable_id}")  
async def get_rsvps_by_shareable_id(shareable_id: str):
    """Get RSVPs using shareable ID (for dashboard admin view)"""
    users_coll, weddings_coll = await get_collections()
    
    # First find the wedding by shareable_id
    wedding = await weddings_coll.find_one({"shareable_id": shareable_id})
    
    if not wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding not found"
        )
    
    # Get RSVPs for this wedding
    rsvps_collection = database.rsvps
    rsvps = await rsvps_collection.find({"wedding_id": wedding["id"]}).to_list(length=None)
    
    # Remove _id from response
    response_data = []
    for rsvp in rsvps:
        clean_rsvp = {k: v for k, v in rsvp.items() if k != "_id"}
        response_data.append(clean_rsvp)
    
    return {"success": True, "rsvps": response_data, "total_count": len(response_data)}

# Guestbook Models
class GuestbookMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wedding_id: str
    name: str
    relationship: Optional[str] = ""
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Guestbook Endpoints
@api_router.post("/guestbook")
async def create_guestbook_message(message_data: dict):
    """Create a new guestbook message"""
    users_coll, weddings_coll = await get_collections()
    
    # Create guestbook message
    guestbook_message = GuestbookMessage(
        wedding_id=message_data.get('wedding_id', ''),
        name=message_data.get('name', ''),
        relationship=message_data.get('relationship', ''),
        message=message_data.get('message', '')
    )
    
    # Convert to dict
    message_dict = guestbook_message.dict()
    message_dict["created_at"] = message_dict["created_at"].isoformat()
    
    # Store message in guestbook collection
    guestbook_collection = database.guestbook
    await guestbook_collection.insert_one(message_dict)
    
    return {"success": True, "message": "Guestbook message added successfully", "message_id": guestbook_message.id}

@api_router.get("/guestbook/{wedding_id}")
async def get_guestbook_messages(wedding_id: str):
    """Get all guestbook messages for a specific wedding"""
    users_coll, weddings_coll = await get_collections()
    
    # Get messages for this wedding
    guestbook_collection = database.guestbook
    messages = await guestbook_collection.find({"wedding_id": wedding_id}).sort("created_at", -1).to_list(length=None)
    
    # Remove _id from response and format dates
    response_data = []
    for msg in messages:
        clean_msg = {k: v for k, v in msg.items() if k != "_id"}
        response_data.append(clean_msg)
    
    return {"success": True, "messages": response_data, "total_count": len(response_data)}

@api_router.get("/guestbook/shareable/{shareable_id}")  
async def get_guestbook_by_shareable_id(shareable_id: str):
    """Get guestbook messages using shareable ID"""
    users_coll, weddings_coll = await get_collections()
    
    # First find the wedding by shareable_id
    wedding = await weddings_coll.find_one({"shareable_id": shareable_id})
    
    if not wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding not found"
        )
    
    # Get guestbook messages for this wedding
    guestbook_collection = database.guestbook
    messages = await guestbook_collection.find({"wedding_id": wedding["id"]}).sort("created_at", -1).to_list(length=None)
    
    # Remove _id from response
    response_data = []
    for msg in messages:
        clean_msg = {k: v for k, v in msg.items() if k != "_id"}
        response_data.append(clean_msg)
    
    return {"success": True, "messages": response_data, "total_count": len(response_data)}

# Wedding Party Management Endpoints
@api_router.put("/wedding/party")
async def update_wedding_party(request_data: dict):
    """Update wedding party data (bridal_party, groom_party, special_roles)"""
    session_id = request_data.get('session_id')
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session ID required"
        )
    
    current_user = await get_current_user_simple(session_id)
    users_coll, weddings_coll = await get_collections()
    
    # Find existing wedding
    existing_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    if not existing_wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding data not found"
        )
    
    # Prepare update data with only wedding party fields
    update_fields = {}
    if 'bridal_party' in request_data:
        update_fields['bridal_party'] = request_data['bridal_party']
    if 'groom_party' in request_data:
        update_fields['groom_party'] = request_data['groom_party']
    if 'special_roles' in request_data:
        update_fields['special_roles'] = request_data['special_roles']
    
    update_fields["updated_at"] = datetime.utcnow().isoformat()
    
    # Update in MongoDB
    await weddings_coll.update_one(
        {"user_id": current_user.id},
        {"$set": update_fields}
    )
    
    # Get updated wedding data
    updated_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    
    # Also update JSON backup
    weddings = load_json_file(WEDDINGS_FILE)
    if updated_wedding["id"] in weddings:
        weddings[updated_wedding["id"]].update(update_fields)
        save_json_file(WEDDINGS_FILE, weddings)
    
    # Remove _id from response
    response_data = {k: v for k, v in updated_wedding.items() if k != "_id"}
    return {"success": True, "wedding_data": response_data}

# Test endpoint to verify connectivity
@api_router.get("/test")
async def test_endpoint():
    return {"status": "ok", "message": "Backend is working", "timestamp": datetime.utcnow()}

# Serve React static files (production setup)
FRONTEND_BUILD_PATH = ROOT_DIR.parent / "frontend" / "build"

# Include the API router first (higher priority)
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Serve static files and React app
if FRONTEND_BUILD_PATH.exists():
    print(f"✅ Frontend build found at: {FRONTEND_BUILD_PATH}")
    app.mount("/static", StaticFiles(directory=str(FRONTEND_BUILD_PATH / "static")), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        """Serve React app for all non-API routes"""
        print(f"🌐 Serving route: {full_path}")
        
        # Skip API routes (they are handled by api_router)
        if full_path.startswith("api"):
            print(f"❌ API route not found: {full_path}")
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # Check if it's a direct file request
        if full_path and not full_path.startswith("api"):
            static_file_path = FRONTEND_BUILD_PATH / full_path
            if static_file_path.exists() and static_file_path.is_file():
                print(f"📁 Serving static file: {static_file_path}")
                return FileResponse(static_file_path)
        
        # For all other routes (including custom wedding URLs), serve React index.html
        index_path = FRONTEND_BUILD_PATH / "index.html"
        print(f"⚛️ Serving React app: {index_path}")
        return FileResponse(index_path)
else:
    print(f"❌ Frontend build not found at: {FRONTEND_BUILD_PATH}")
    print("React static file serving disabled")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Startup and shutdown events for MongoDB
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    logger.info("✅ Wedding Card API started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
    active_sessions.clear()
    # Note: Sessions are persisted in MongoDB and will be restored on restart
    logger.info("👋 Wedding Card API shutdown complete")