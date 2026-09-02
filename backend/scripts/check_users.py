import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.core.security import verify_password, get_password_hash
from app.seed.seed_data import seed_database

db = SessionLocal()
users = db.query(User).all()
print(f"Total users found in database: {len(users)}")

if len(users) == 0:
    print("Database has no users! Running seed_database()...")
    seed_database()
    users = db.query(User).all()

for u in users:
    v_off = verify_password("Officer@1234", u.hashed_password)
    v_adm = verify_password("Admin@1234", u.hashed_password)
    print(f"User: {u.email} | Active: {u.is_active} | Matches Officer@1234: {v_off} | Matches Admin@1234: {v_adm}")

# Let's also explicitly reset/update passwords to be 100% sure
for u in users:
    if "officer" in u.email:
        u.hashed_password = get_password_hash("Officer@1234")
        u.is_active = True
    elif "admin" in u.email:
        u.hashed_password = get_password_hash("Admin@1234")
        u.is_active = True
    elif "auditor" in u.email:
        u.hashed_password = get_password_hash("Auditor@1234")
        u.is_active = True
db.commit()
print("Passwords verified and updated successfully!")
