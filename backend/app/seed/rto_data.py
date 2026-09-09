"""
Authoritative dataset of all Indian States, Union Territories, verified RTO codes,
and official vehicle number plate categories according to MoRTH (Ministry of Road Transport and Highways).
"""
from typing import List, Dict

STATES_DATA: List[Dict] = [
    {"name": "Andhra Pradesh", "code": "AP", "type": "STATE", "capital": "Amaravati", "zone": "South", "example_plate": "AP-39-AB-1234"},
    {"name": "Arunachal Pradesh", "code": "AR", "type": "STATE", "capital": "Itanagar", "zone": "North-East", "example_plate": "AR-01-AB-1234"},
    {"name": "Assam", "code": "AS", "type": "STATE", "capital": "Dispur", "zone": "North-East", "example_plate": "AS-01-AB-1234"},
    {"name": "Bihar", "code": "BR", "type": "STATE", "capital": "Patna", "zone": "East", "example_plate": "BR-01-AB-1234"},
    {"name": "Chhattisgarh", "code": "CG", "type": "STATE", "capital": "Raipur", "zone": "Central", "example_plate": "CG-04-AB-1234"},
    {"name": "Goa", "code": "GA", "type": "STATE", "capital": "Panaji", "zone": "West", "example_plate": "GA-01-AB-1234"},
    {"name": "Gujarat", "code": "GJ", "type": "STATE", "capital": "Gandhinagar", "zone": "West", "example_plate": "GJ-01-AB-1234"},
    {"name": "Haryana", "code": "HR", "type": "STATE", "capital": "Chandigarh", "zone": "North", "example_plate": "HR-26-AB-1234"},
    {"name": "Himachal Pradesh", "code": "HP", "type": "STATE", "capital": "Shimla", "zone": "North", "example_plate": "HP-01-AB-1234"},
    {"name": "Jharkhand", "code": "JH", "type": "STATE", "capital": "Ranchi", "zone": "East", "example_plate": "JH-01-AB-1234"},
    {"name": "Karnataka", "code": "KA", "type": "STATE", "capital": "Bengaluru", "zone": "South", "example_plate": "KA-01-AB-1234"},
    {"name": "Kerala", "code": "KL", "type": "STATE", "capital": "Thiruvananthapuram", "zone": "South", "example_plate": "KL-01-AB-1234"},
    {"name": "Madhya Pradesh", "code": "MP", "type": "STATE", "capital": "Bhopal", "zone": "Central", "example_plate": "MP-09-AB-1234"},
    {"name": "Maharashtra", "code": "MH", "type": "STATE", "capital": "Mumbai", "zone": "West", "example_plate": "MH-12-AB-1234"},
    {"name": "Manipur", "code": "MN", "type": "STATE", "capital": "Imphal", "zone": "North-East", "example_plate": "MN-01-AB-1234"},
    {"name": "Meghalaya", "code": "ML", "type": "STATE", "capital": "Shillong", "zone": "North-East", "example_plate": "ML-05-AB-1234"},
    {"name": "Mizoram", "code": "MZ", "type": "STATE", "capital": "Aizawl", "zone": "North-East", "example_plate": "MZ-01-AB-1234"},
    {"name": "Nagaland", "code": "NL", "type": "STATE", "capital": "Kohima", "zone": "North-East", "example_plate": "NL-01-AB-1234"},
    {"name": "Odisha", "code": "OD", "type": "STATE", "capital": "Bhubaneswar", "zone": "East", "example_plate": "OD-02-AB-1234"},
    {"name": "Punjab", "code": "PB", "type": "STATE", "capital": "Chandigarh", "zone": "North", "example_plate": "PB-10-AB-1234"},
    {"name": "Rajasthan", "code": "RJ", "type": "STATE", "capital": "Jaipur", "zone": "North", "example_plate": "RJ-14-AB-1234"},
    {"name": "Sikkim", "code": "SK", "type": "STATE", "capital": "Gangtok", "zone": "North-East", "example_plate": "SK-01-AB-1234"},
    {"name": "Tamil Nadu", "code": "TN", "type": "STATE", "capital": "Chennai", "zone": "South", "example_plate": "TN-01-AB-1234"},
    {"name": "Telangana", "code": "TG", "type": "STATE", "capital": "Hyderabad", "zone": "South", "example_plate": "TG-09-AB-1234"},
    {"name": "Tripura", "code": "TR", "type": "STATE", "capital": "Agartala", "zone": "North-East", "example_plate": "TR-01-AB-1234"},
    {"name": "Uttar Pradesh", "code": "UP", "type": "STATE", "capital": "Lucknow", "zone": "North", "example_plate": "UP-32-AB-1234"},
    {"name": "Uttarakhand", "code": "UK", "type": "STATE", "capital": "Dehradun", "zone": "North", "example_plate": "UK-07-AB-1234"},
    {"name": "West Bengal", "code": "WB", "type": "STATE", "capital": "Kolkata", "zone": "East", "example_plate": "WB-02-AB-1234"},
    # 8 Union Territories
    {"name": "Andaman and Nicobar Islands", "code": "AN", "type": "UNION_TERRITORY", "capital": "Port Blair", "zone": "Islands", "example_plate": "AN-01-AB-1234"},
    {"name": "Chandigarh", "code": "CH", "type": "UNION_TERRITORY", "capital": "Chandigarh", "zone": "North", "example_plate": "CH-01-AB-1234"},
    {"name": "Dadra & Nagar Haveli and Daman & Diu", "code": "DD", "type": "UNION_TERRITORY", "capital": "Daman", "zone": "West", "example_plate": "DD-01-AB-1234"},
    {"name": "Delhi", "code": "DL", "type": "UNION_TERRITORY", "capital": "New Delhi", "zone": "North", "example_plate": "DL-01-AB-1234"},
    {"name": "Jammu and Kashmir", "code": "JK", "type": "UNION_TERRITORY", "capital": "Srinagar / Jammu", "zone": "North", "example_plate": "JK-01-AB-1234"},
    {"name": "Ladakh", "code": "LA", "type": "UNION_TERRITORY", "capital": "Leh", "zone": "North", "example_plate": "LA-01-AB-1234"},
    {"name": "Lakshadweep", "code": "LD", "type": "UNION_TERRITORY", "capital": "Kavaratti", "zone": "Islands", "example_plate": "LD-01-AB-1234"},
    {"name": "Puducherry", "code": "PY", "type": "UNION_TERRITORY", "capital": "Puducherry", "zone": "South", "example_plate": "PY-01-AB-1234"}
]

RTO_OFFICES_DATA: List[Dict] = [
    # --- GUJARAT (GJ) Complete Official Listing (GJ-01 to GJ-38) ---
    {"state_code": "GJ", "rto_code": "GJ-01", "district": "Ahmedabad", "city": "Ahmedabad (Subhash Bridge)", "office_name": "RTO Ahmedabad Central"},
    {"state_code": "GJ", "rto_code": "GJ-02", "district": "Mehsana", "city": "Mehsana", "office_name": "RTO Mehsana"},
    {"state_code": "GJ", "rto_code": "GJ-03", "district": "Rajkot", "city": "Rajkot", "office_name": "RTO Rajkot"},
    {"state_code": "GJ", "rto_code": "GJ-04", "district": "Bhavnagar", "city": "Bhavnagar", "office_name": "RTO Bhavnagar"},
    {"state_code": "GJ", "rto_code": "GJ-05", "district": "Surat", "city": "Surat (Majura Gate)", "office_name": "RTO Surat City"},
    {"state_code": "GJ", "rto_code": "GJ-06", "district": "Vadodara", "city": "Vadodara", "office_name": "RTO Vadodara"},
    {"state_code": "GJ", "rto_code": "GJ-07", "district": "Kheda", "city": "Nadiad", "office_name": "ARTO Nadiad"},
    {"state_code": "GJ", "rto_code": "GJ-08", "district": "Banaskantha", "city": "Palanpur", "office_name": "ARTO Palanpur"},
    {"state_code": "GJ", "rto_code": "GJ-09", "district": "Sabarkantha", "city": "Himmatnagar", "office_name": "ARTO Himmatnagar"},
    {"state_code": "GJ", "rto_code": "GJ-10", "district": "Jamnagar", "city": "Jamnagar", "office_name": "RTO Jamnagar"},
    {"state_code": "GJ", "rto_code": "GJ-11", "district": "Junagadh", "city": "Junagadh", "office_name": "RTO Junagadh"},
    {"state_code": "GJ", "rto_code": "GJ-12", "district": "Kutch", "city": "Bhuj", "office_name": "RTO Bhuj"},
    {"state_code": "GJ", "rto_code": "GJ-13", "district": "Surendranagar", "city": "Surendranagar", "office_name": "ARTO Surendranagar"},
    {"state_code": "GJ", "rto_code": "GJ-14", "district": "Amreli", "city": "Amreli", "office_name": "ARTO Amreli"},
    {"state_code": "GJ", "rto_code": "GJ-15", "district": "Valsad", "city": "Valsad", "office_name": "ARTO Valsad"},
    {"state_code": "GJ", "rto_code": "GJ-16", "district": "Bharuch", "city": "Bharuch", "office_name": "ARTO Bharuch"},
    {"state_code": "GJ", "rto_code": "GJ-17", "district": "Panchmahal", "city": "Godhra", "office_name": "ARTO Godhra"},
    {"state_code": "GJ", "rto_code": "GJ-18", "district": "Gandhinagar", "city": "Gandhinagar", "office_name": "RTO Gandhinagar"},
    {"state_code": "GJ", "rto_code": "GJ-19", "district": "Surat Rural", "city": "Bardoli", "office_name": "ARTO Bardoli"},
    {"state_code": "GJ", "rto_code": "GJ-20", "district": "Dahod", "city": "Dahod", "office_name": "ARTO Dahod"},
    {"state_code": "GJ", "rto_code": "GJ-21", "district": "Navsari", "city": "Navsari", "office_name": "ARTO Navsari"},
    {"state_code": "GJ", "rto_code": "GJ-22", "district": "Narmada", "city": "Rajpipla", "office_name": "ARTO Rajpipla"},
    {"state_code": "GJ", "rto_code": "GJ-23", "district": "Anand", "city": "Anand", "office_name": "ARTO Anand"},
    {"state_code": "GJ", "rto_code": "GJ-24", "district": "Patan", "city": "Patan", "office_name": "ARTO Patan"},
    {"state_code": "GJ", "rto_code": "GJ-25", "district": "Porbandar", "city": "Porbandar", "office_name": "ARTO Porbandar"},
    {"state_code": "GJ", "rto_code": "GJ-26", "district": "Tapi", "city": "Vyara", "office_name": "ARTO Vyara"},
    {"state_code": "GJ", "rto_code": "GJ-27", "district": "Ahmedabad East", "city": "Ahmedabad (Vastral)", "office_name": "RTO Ahmedabad East"},
    {"state_code": "GJ", "rto_code": "GJ-28", "district": "Surat West / Rural", "city": "Surat (Pal)", "office_name": "ARTO Pal"},
    {"state_code": "GJ", "rto_code": "GJ-29", "district": "Vadodara Rural", "city": "Vadodara (Dabhoi)", "office_name": "ARTO Dabhoi"},
    {"state_code": "GJ", "rto_code": "GJ-30", "district": "Dang", "city": "Ahwa", "office_name": "ARTO Ahwa"},
    {"state_code": "GJ", "rto_code": "GJ-31", "district": "Aravalli", "city": "Modasa", "office_name": "ARTO Modasa"},
    {"state_code": "GJ", "rto_code": "GJ-32", "district": "Gir Somnath", "city": "Veraval", "office_name": "ARTO Veraval"},
    {"state_code": "GJ", "rto_code": "GJ-33", "district": "Botad", "city": "Botad", "office_name": "ARTO Botad"},
    {"state_code": "GJ", "rto_code": "GJ-34", "district": "Chhota Udepur", "city": "Chhota Udepur", "office_name": "ARTO Chhota Udepur"},
    {"state_code": "GJ", "rto_code": "GJ-35", "district": "Mahisagar", "city": "Lunawada", "office_name": "ARTO Lunawada"},
    {"state_code": "GJ", "rto_code": "GJ-36", "district": "Morbi", "city": "Morbi", "office_name": "ARTO Morbi"},
    {"state_code": "GJ", "rto_code": "GJ-37", "district": "Devbhumi Dwarka", "city": "Khambhaliya", "office_name": "ARTO Khambhaliya"},
    {"state_code": "GJ", "rto_code": "GJ-38", "district": "Ahmedabad Rural", "city": "Bavla", "office_name": "ARTO Bavla"},

    # --- MAHARASHTRA (MH) Key Official RTOs ---
    {"state_code": "MH", "rto_code": "MH-01", "district": "Mumbai City", "city": "Mumbai (Tardeo)", "office_name": "RTO Mumbai Central"},
    {"state_code": "MH", "rto_code": "MH-02", "district": "Mumbai Suburban", "city": "Mumbai (Andheri)", "office_name": "RTO Mumbai West"},
    {"state_code": "MH", "rto_code": "MH-03", "district": "Mumbai Suburban", "city": "Mumbai (Wadala)", "office_name": "RTO Mumbai East"},
    {"state_code": "MH", "rto_code": "MH-04", "district": "Thane", "city": "Thane", "office_name": "RTO Thane"},
    {"state_code": "MH", "rto_code": "MH-05", "district": "Kalyan", "city": "Kalyan-Dombivli", "office_name": "DY RTO Kalyan"},
    {"state_code": "MH", "rto_code": "MH-06", "district": "Raigad", "city": "Pen", "office_name": "RTO Pen (Raigad)"},
    {"state_code": "MH", "rto_code": "MH-07", "district": "Sindhudurg", "city": "Sindhudurg", "office_name": "DY RTO Sindhudurg"},
    {"state_code": "MH", "rto_code": "MH-08", "district": "Ratnagiri", "city": "Ratnagiri", "office_name": "DY RTO Ratnagiri"},
    {"state_code": "MH", "rto_code": "MH-09", "district": "Kolhapur", "city": "Kolhapur", "office_name": "RTO Kolhapur"},
    {"state_code": "MH", "rto_code": "MH-10", "district": "Sangli", "city": "Sangli", "office_name": "DY RTO Sangli"},
    {"state_code": "MH", "rto_code": "MH-11", "district": "Satara", "city": "Satara", "office_name": "DY RTO Satara"},
    {"state_code": "MH", "rto_code": "MH-12", "district": "Pune", "city": "Pune", "office_name": "RTO Pune"},
    {"state_code": "MH", "rto_code": "MH-13", "district": "Solapur", "city": "Solapur", "office_name": "RTO Solapur"},
    {"state_code": "MH", "rto_code": "MH-14", "district": "Pune Suburban", "city": "Pimpri-Chinchwad", "office_name": "DY RTO Pimpri Chinchwad"},
    {"state_code": "MH", "rto_code": "MH-15", "district": "Nashik", "city": "Nashik", "office_name": "RTO Nashik"},
    {"state_code": "MH", "rto_code": "MH-16", "district": "Ahmednagar", "city": "Ahmednagar (Ahilyanagar)", "office_name": "DY RTO Ahmednagar"},
    {"state_code": "MH", "rto_code": "MH-17", "district": "Ahmednagar", "city": "Shrirampur", "office_name": "DY RTO Shrirampur"},
    {"state_code": "MH", "rto_code": "MH-18", "district": "Dhule", "city": "Dhule", "office_name": "RTO Dhule"},
    {"state_code": "MH", "rto_code": "MH-19", "district": "Jalgaon", "city": "Jalgaon", "office_name": "DY RTO Jalgaon"},
    {"state_code": "MH", "rto_code": "MH-20", "district": "Chhatrapati Sambhajinagar", "city": "Aurangabad", "office_name": "RTO Sambhajinagar"},
    {"state_code": "MH", "rto_code": "MH-21", "district": "Jalna", "city": "Jalna", "office_name": "DY RTO Jalna"},
    {"state_code": "MH", "rto_code": "MH-22", "district": "Parbhani", "city": "Parbhani", "office_name": "DY RTO Parbhani"},
    {"state_code": "MH", "rto_code": "MH-23", "district": "Beed", "city": "Beed", "office_name": "DY RTO Beed"},
    {"state_code": "MH", "rto_code": "MH-24", "district": "Latur", "city": "Latur", "office_name": "RTO Latur"},
    {"state_code": "MH", "rto_code": "MH-25", "district": "Dharashiv", "city": "Osmanabad", "office_name": "DY RTO Dharashiv"},
    {"state_code": "MH", "rto_code": "MH-26", "district": "Nanded", "city": "Nanded", "office_name": "RTO Nanded"},
    {"state_code": "MH", "rto_code": "MH-27", "district": "Amravati", "city": "Amravati", "office_name": "RTO Amravati"},
    {"state_code": "MH", "rto_code": "MH-28", "district": "Buldhana", "city": "Buldhana", "office_name": "DY RTO Buldhana"},
    {"state_code": "MH", "rto_code": "MH-29", "district": "Yavatmal", "city": "Yavatmal", "office_name": "DY RTO Yavatmal"},
    {"state_code": "MH", "rto_code": "MH-30", "district": "Akola", "city": "Akola", "office_name": "DY RTO Akola"},
    {"state_code": "MH", "rto_code": "MH-31", "district": "Nagpur Urban", "city": "Nagpur City", "office_name": "RTO Nagpur City"},
    {"state_code": "MH", "rto_code": "MH-32", "district": "Wardha", "city": "Wardha", "office_name": "DY RTO Wardha"},
    {"state_code": "MH", "rto_code": "MH-33", "district": "Gadchiroli", "city": "Gadchiroli", "office_name": "DY RTO Gadchiroli"},
    {"state_code": "MH", "rto_code": "MH-34", "district": "Chandrapur", "city": "Chandrapur", "office_name": "DY RTO Chandrapur"},
    {"state_code": "MH", "rto_code": "MH-35", "district": "Gondia", "city": "Gondia", "office_name": "DY RTO Gondia"},
    {"state_code": "MH", "rto_code": "MH-36", "district": "Bhandara", "city": "Bhandara", "office_name": "DY RTO Bhandara"},
    {"state_code": "MH", "rto_code": "MH-37", "district": "Washim", "city": "Washim", "office_name": "DY RTO Washim"},
    {"state_code": "MH", "rto_code": "MH-38", "district": "Hingoli", "city": "Hingoli", "office_name": "DY RTO Hingoli"},
    {"state_code": "MH", "rto_code": "MH-39", "district": "Nandurbar", "city": "Nandurbar", "office_name": "DY RTO Nandurbar"},
    {"state_code": "MH", "rto_code": "MH-40", "district": "Nagpur Rural", "city": "Nagpur Rural", "office_name": "DY RTO Nagpur Rural"},
    {"state_code": "MH", "rto_code": "MH-41", "district": "Nashik Rural", "city": "Malegaon", "office_name": "DY RTO Malegaon"},
    {"state_code": "MH", "rto_code": "MH-42", "district": "Pune Rural", "city": "Baramati", "office_name": "DY RTO Baramati"},
    {"state_code": "MH", "rto_code": "MH-43", "district": "Thane Suburban", "city": "Navi Mumbai (Vashi)", "office_name": "DY RTO Navi Mumbai"},
    {"state_code": "MH", "rto_code": "MH-44", "district": "Beed Rural", "city": "Ambajogai", "office_name": "DY RTO Ambajogai"},
    {"state_code": "MH", "rto_code": "MH-45", "district": "Solapur Rural", "city": "Akluj", "office_name": "DY RTO Akluj"},
    {"state_code": "MH", "rto_code": "MH-46", "district": "Raigad", "city": "Panvel", "office_name": "RTO Panvel"},
    {"state_code": "MH", "rto_code": "MH-47", "district": "Mumbai North", "city": "Mumbai (Borivali)", "office_name": "DY RTO Borivali"},
    {"state_code": "MH", "rto_code": "MH-48", "district": "Palghar", "city": "Vasai-Virar", "office_name": "DY RTO Vasai Virar"},
    {"state_code": "MH", "rto_code": "MH-49", "district": "Nagpur East", "city": "Nagpur East", "office_name": "DY RTO Nagpur East"},
    {"state_code": "MH", "rto_code": "MH-50", "district": "Satara Rural", "city": "Karad", "office_name": "DY RTO Karad"},

    # --- DELHI (DL) Complete Official RTOs (DL-01 to DL-16) ---
    {"state_code": "DL", "rto_code": "DL-01", "district": "North Delhi", "city": "Mall Road / Civil Lines", "office_name": "MLO Mall Road"},
    {"state_code": "DL", "rto_code": "DL-02", "district": "New Delhi", "city": "Tilak Marg", "office_name": "MLO Tilak Marg"},
    {"state_code": "DL", "rto_code": "DL-03", "district": "South Delhi", "city": "Sheikh Sarai", "office_name": "MLO Sheikh Sarai"},
    {"state_code": "DL", "rto_code": "DL-04", "district": "West Delhi I", "city": "Janakpuri", "office_name": "MLO Janakpuri"},
    {"state_code": "DL", "rto_code": "DL-05", "district": "North East Delhi", "city": "Loni Road", "office_name": "MLO Loni Road"},
    {"state_code": "DL", "rto_code": "DL-06", "district": "Central Delhi", "city": "Sarai Kale Khan", "office_name": "MLO Sarai Kale Khan"},
    {"state_code": "DL", "rto_code": "DL-07", "district": "East Delhi I", "city": "Mayur Vihar", "office_name": "MLO Mayur Vihar"},
    {"state_code": "DL", "rto_code": "DL-08", "district": "North West Delhi I", "city": "Wazirpur", "office_name": "MLO Wazirpur"},
    {"state_code": "DL", "rto_code": "DL-09", "district": "South West Delhi I", "city": "Palam", "office_name": "MLO Palam"},
    {"state_code": "DL", "rto_code": "DL-10", "district": "West Delhi II", "city": "Raja Garden", "office_name": "MLO Raja Garden"},
    {"state_code": "DL", "rto_code": "DL-11", "district": "North West Delhi II", "city": "Rohini", "office_name": "MLO Rohini"},
    {"state_code": "DL", "rto_code": "DL-12", "district": "South West Delhi II", "city": "Vasant Vihar", "office_name": "MLO Vasant Vihar"},
    {"state_code": "DL", "rto_code": "DL-13", "district": "East Delhi II", "city": "Surajmal Vihar", "office_name": "MLO Surajmal Vihar"},
    {"state_code": "DL", "rto_code": "DL-14", "district": "South West Delhi III", "city": "Dwarka", "office_name": "MLO Dwarka"},
    {"state_code": "DL", "rto_code": "DL-15", "district": "North Delhi II", "city": "Burari (Commercial Only)", "office_name": "MLO Burari Unit"},
    {"state_code": "DL", "rto_code": "DL-16", "district": "East Delhi III", "city": "Gazipur", "office_name": "MLO Gazipur"},

    # --- RAJASTHAN (RJ) Key Official RTOs ---
    {"state_code": "RJ", "rto_code": "RJ-01", "district": "Ajmer", "city": "Ajmer", "office_name": "RTO Ajmer"},
    {"state_code": "RJ", "rto_code": "RJ-02", "district": "Alwar", "city": "Alwar", "office_name": "RTO Alwar"},
    {"state_code": "RJ", "rto_code": "RJ-03", "district": "Banswara", "city": "Banswara", "office_name": "DTO Banswara"},
    {"state_code": "RJ", "rto_code": "RJ-04", "district": "Barmer", "city": "Barmer", "office_name": "DTO Barmer"},
    {"state_code": "RJ", "rto_code": "RJ-05", "district": "Bharatpur", "city": "Bharatpur", "office_name": "RTO Bharatpur"},
    {"state_code": "RJ", "rto_code": "RJ-06", "district": "Bhilwara", "city": "Bhilwara", "office_name": "DTO Bhilwara"},
    {"state_code": "RJ", "rto_code": "RJ-07", "district": "Bikaner", "city": "Bikaner", "office_name": "RTO Bikaner"},
    {"state_code": "RJ", "rto_code": "RJ-08", "district": "Bundi", "city": "Bundi", "office_name": "DTO Bundi"},
    {"state_code": "RJ", "rto_code": "RJ-09", "district": "Chittorgarh", "city": "Chittorgarh", "office_name": "RTO Chittorgarh"},
    {"state_code": "RJ", "rto_code": "RJ-10", "district": "Churu", "city": "Churu", "office_name": "DTO Churu"},
    {"state_code": "RJ", "rto_code": "RJ-11", "district": "Dholpur", "city": "Dholpur", "office_name": "DTO Dholpur"},
    {"state_code": "RJ", "rto_code": "RJ-12", "district": "Dungarpur", "city": "Dungarpur", "office_name": "DTO Dungarpur"},
    {"state_code": "RJ", "rto_code": "RJ-13", "district": "Sri Ganganagar", "city": "Sri Ganganagar", "office_name": "DTO Sri Ganganagar"},
    {"state_code": "RJ", "rto_code": "RJ-14", "district": "Jaipur South", "city": "Jaipur", "office_name": "RTO Jaipur South"},
    {"state_code": "RJ", "rto_code": "RJ-15", "district": "Jaisalmer", "city": "Jaisalmer", "office_name": "DTO Jaisalmer"},
    {"state_code": "RJ", "rto_code": "RJ-16", "district": "Jalore", "city": "Jalore", "office_name": "DTO Jalore"},
    {"state_code": "RJ", "rto_code": "RJ-17", "district": "Jhalawar", "city": "Jhalawar", "office_name": "DTO Jhalawar"},
    {"state_code": "RJ", "rto_code": "RJ-18", "district": "Jhunjhunu", "city": "Jhunjhunu", "office_name": "DTO Jhunjhunu"},
    {"state_code": "RJ", "rto_code": "RJ-19", "district": "Jodhpur", "city": "Jodhpur", "office_name": "RTO Jodhpur"},
    {"state_code": "RJ", "rto_code": "RJ-20", "district": "Kota", "city": "Kota", "office_name": "RTO Kota"},
    {"state_code": "RJ", "rto_code": "RJ-21", "district": "Nagaur", "city": "Nagaur", "office_name": "DTO Nagaur"},
    {"state_code": "RJ", "rto_code": "RJ-22", "district": "Pali", "city": "Pali", "office_name": "RTO Pali"},
    {"state_code": "RJ", "rto_code": "RJ-23", "district": "Sikar", "city": "Sikar", "office_name": "RTO Sikar"},
    {"state_code": "RJ", "rto_code": "RJ-24", "district": "Sirohi", "city": "Sirohi", "office_name": "DTO Sirohi"},
    {"state_code": "RJ", "rto_code": "RJ-25", "district": "Sawai Madhopur", "city": "Sawai Madhopur", "office_name": "DTO Sawai Madhopur"},
    {"state_code": "RJ", "rto_code": "RJ-26", "district": "Tonk", "city": "Tonk", "office_name": "DTO Tonk"},
    {"state_code": "RJ", "rto_code": "RJ-27", "district": "Udaipur", "city": "Udaipur", "office_name": "RTO Udaipur"},
    {"state_code": "RJ", "rto_code": "RJ-45", "district": "Jaipur North", "city": "Jaipur (Vidhyadhar Nagar)", "office_name": "RTO Jaipur North"},

    # --- KARNATAKA (KA) Key Official RTOs ---
    {"state_code": "KA", "rto_code": "KA-01", "district": "Bengaluru Urban", "city": "Bengaluru (Koramangala)", "office_name": "RTO Bengaluru Central"},
    {"state_code": "KA", "rto_code": "KA-02", "district": "Bengaluru Urban", "city": "Bengaluru (Rajajinagar)", "office_name": "RTO Bengaluru West"},
    {"state_code": "KA", "rto_code": "KA-03", "district": "Bengaluru Urban", "city": "Bengaluru (Indiranagar)", "office_name": "RTO Bengaluru East"},
    {"state_code": "KA", "rto_code": "KA-04", "district": "Bengaluru Urban", "city": "Bengaluru (Yeshwanthpur)", "office_name": "RTO Bengaluru North"},
    {"state_code": "KA", "rto_code": "KA-05", "district": "Bengaluru Urban", "city": "Bengaluru (Jayanagar)", "office_name": "RTO Bengaluru South"},
    {"state_code": "KA", "rto_code": "KA-09", "district": "Mysuru", "city": "Mysuru (West)", "office_name": "RTO Mysuru West"},
    {"state_code": "KA", "rto_code": "KA-19", "district": "Dakshina Kannada", "city": "Mangaluru", "office_name": "RTO Mangaluru"},
    {"state_code": "KA", "rto_code": "KA-20", "district": "Udupi", "city": "Udupi", "office_name": "RTO Udupi"},
    {"state_code": "KA", "rto_code": "KA-22", "district": "Belagavi", "city": "Belagavi", "office_name": "RTO Belagavi"},
    {"state_code": "KA", "rto_code": "KA-25", "district": "Dharwad", "city": "Hubballi-Dharwad", "office_name": "RTO Dharwad"},
    {"state_code": "KA", "rto_code": "KA-51", "district": "Bengaluru Urban", "city": "Bengaluru (Electronic City)", "office_name": "ARTO Electronic City"},
    {"state_code": "KA", "rto_code": "KA-53", "district": "Bengaluru Urban", "city": "Bengaluru (K.R. Puram)", "office_name": "ARTO K.R. Puram"},

    # --- TAMIL NADU (TN) Key Official RTOs ---
    {"state_code": "TN", "rto_code": "TN-01", "district": "Chennai Central", "city": "Chennai (Ayanavaram)", "office_name": "RTO Chennai Central"},
    {"state_code": "TN", "rto_code": "TN-02", "district": "Chennai North West", "city": "Chennai (Anna Nagar)", "office_name": "RTO Chennai North West"},
    {"state_code": "TN", "rto_code": "TN-07", "district": "Chennai South", "city": "Chennai (Thiruvanmiyur)", "office_name": "RTO Chennai South"},
    {"state_code": "TN", "rto_code": "TN-09", "district": "Chennai West", "city": "Chennai (K.K. Nagar)", "office_name": "RTO Chennai West"},
    {"state_code": "TN", "rto_code": "TN-22", "district": "Chengalpattu", "city": "Meenambakkam", "office_name": "RTO Meenambakkam"},
    {"state_code": "TN", "rto_code": "TN-37", "district": "Coimbatore South", "city": "Coimbatore", "office_name": "RTO Coimbatore South"},
    {"state_code": "TN", "rto_code": "TN-38", "district": "Coimbatore North", "city": "Coimbatore", "office_name": "RTO Coimbatore North"},
    {"state_code": "TN", "rto_code": "TN-58", "district": "Madurai South", "city": "Madurai", "office_name": "RTO Madurai South"},
    {"state_code": "TN", "rto_code": "TN-59", "district": "Madurai North", "city": "Madurai", "office_name": "RTO Madurai North"},

    # --- UTTAR PRADESH (UP) Key Official RTOs ---
    {"state_code": "UP", "rto_code": "UP-14", "district": "Ghaziabad", "city": "Ghaziabad", "office_name": "RTO Ghaziabad"},
    {"state_code": "UP", "rto_code": "UP-16", "district": "Gautam Buddha Nagar", "city": "Noida", "office_name": "ARTO Noida"},
    {"state_code": "UP", "rto_code": "UP-32", "district": "Lucknow", "city": "Lucknow (Transport Nagar)", "office_name": "RTO Lucknow"},
    {"state_code": "UP", "rto_code": "UP-53", "district": "Gorakhpur", "city": "Gorakhpur", "office_name": "RTO Gorakhpur"},
    {"state_code": "UP", "rto_code": "UP-65", "district": "Varanasi", "city": "Varanasi", "office_name": "RTO Varanasi"},
    {"state_code": "UP", "rto_code": "UP-70", "district": "Prayagraj", "city": "Prayagraj (Allahabad)", "office_name": "RTO Prayagraj"},
    {"state_code": "UP", "rto_code": "UP-78", "district": "Kanpur Nagar", "city": "Kanpur", "office_name": "RTO Kanpur"},
    {"state_code": "UP", "rto_code": "UP-80", "district": "Agra", "city": "Agra", "office_name": "RTO Agra"},

    # --- TELANGANA (TG / TS) Key Official RTOs ---
    {"state_code": "TG", "rto_code": "TG-09", "district": "Hyderabad Central", "city": "Hyderabad (Khairatabad)", "office_name": "RTO Khairatabad"},
    {"state_code": "TG", "rto_code": "TG-10", "district": "Secunderabad", "city": "Secunderabad", "office_name": "RTO Secunderabad"},
    {"state_code": "TG", "rto_code": "TG-11", "district": "Hyderabad East", "city": "Hyderabad (Malakpet)", "office_name": "RTO Malakpet"},
    {"state_code": "TG", "rto_code": "TG-12", "district": "Hyderabad South", "city": "Hyderabad (Bahadurpura)", "office_name": "RTO Bahadurpura"},
    {"state_code": "TG", "rto_code": "TG-28", "district": "Medchal-Malkajgiri", "city": "Kukatpally", "office_name": "RTO Kukatpally"},

    # --- KERALA (KL) Key Official RTOs ---
    {"state_code": "KL", "rto_code": "KL-01", "district": "Thiruvananthapuram", "city": "Thiruvananthapuram", "office_name": "RTO Thiruvananthapuram"},
    {"state_code": "KL", "rto_code": "KL-07", "district": "Ernakulam", "city": "Kochi", "office_name": "RTO Ernakulam"},
    {"state_code": "KL", "rto_code": "KL-11", "district": "Kozhikode", "city": "Kozhikode", "office_name": "RTO Kozhikode"},
    {"state_code": "KL", "rto_code": "KL-08", "district": "Thrissur", "city": "Thrissur", "office_name": "RTO Thrissur"},

    # --- WEST BENGAL (WB) Key Official RTOs ---
    {"state_code": "WB", "rto_code": "WB-01", "district": "Kolkata North", "city": "Kolkata (Beltala)", "office_name": "PVD Kolkata"},
    {"state_code": "WB", "rto_code": "WB-02", "district": "Kolkata North", "city": "Kolkata", "office_name": "RTO Kolkata Central"},
    {"state_code": "WB", "rto_code": "WB-19", "district": "South 24 Parganas", "city": "Alipore", "office_name": "RTO Alipore"},
    {"state_code": "WB", "rto_code": "WB-20", "district": "Kolkata South", "city": "Kolkata (Kasba)", "office_name": "ARTO Kasba"},

    # --- PUNJAB (PB) & HARYANA (HR) ---
    {"state_code": "PB", "rto_code": "PB-10", "district": "Ludhiana", "city": "Ludhiana", "office_name": "RTO Ludhiana"},
    {"state_code": "PB", "rto_code": "PB-02", "district": "Amritsar", "city": "Amritsar", "office_name": "RTO Amritsar"},
    {"state_code": "HR", "rto_code": "HR-26", "district": "Gurugram North", "city": "Gurugram (North)", "office_name": "RTA Gurugram"},
    {"state_code": "HR", "rto_code": "HR-51", "district": "Faridabad", "city": "Faridabad", "office_name": "RTA Faridabad"},

    # --- BIHAR (BR) & JHARKHAND (JH) ---
    {"state_code": "BR", "rto_code": "BR-01", "district": "Patna", "city": "Patna", "office_name": "DTO Patna"},
    {"state_code": "BR", "rto_code": "BR-06", "district": "Muzaffarpur", "city": "Muzaffarpur", "office_name": "DTO Muzaffarpur"},
    {"state_code": "JH", "rto_code": "JH-01", "district": "Ranchi", "city": "Ranchi", "office_name": "DTO Ranchi"},
    {"state_code": "JH", "rto_code": "JH-05", "district": "East Singhbhum", "city": "Jamshedpur", "office_name": "DTO Jamshedpur"},

    # --- MADHYA PRADESH (MP) ---
    {"state_code": "MP", "rto_code": "MP-04", "district": "Bhopal", "city": "Bhopal", "office_name": "RTO Bhopal"},
    {"state_code": "MP", "rto_code": "MP-09", "district": "Indore", "city": "Indore", "office_name": "RTO Indore"},

    # --- CHHATTISGARH (CG) & ODISHA (OD) ---
    {"state_code": "CG", "rto_code": "CG-04", "district": "Raipur", "city": "Raipur", "office_name": "RTO Raipur"},
    {"state_code": "OD", "rto_code": "OD-02", "district": "Bhubaneswar", "city": "Bhubaneswar", "office_name": "RTO Bhubaneswar"},

    # --- UNION TERRITORIES (CH, JK, LA, PY, AN, DD, LD) ---
    {"state_code": "CH", "rto_code": "CH-01", "district": "Chandigarh", "city": "Chandigarh", "office_name": "RLA Chandigarh"},
    {"state_code": "JK", "rto_code": "JK-01", "district": "Srinagar", "city": "Srinagar", "office_name": "RTO Srinagar"},
    {"state_code": "JK", "rto_code": "JK-02", "district": "Jammu", "city": "Jammu", "office_name": "RTO Jammu"},
    {"state_code": "LA", "rto_code": "LA-01", "district": "Leh", "city": "Leh Ladakh", "office_name": "ARTO Leh"},
    {"state_code": "PY", "rto_code": "PY-01", "district": "Puducherry", "city": "Puducherry", "office_name": "Transport Dept Puducherry"},
    {"state_code": "AN", "rto_code": "AN-01", "district": "South Andaman", "city": "Port Blair", "office_name": "Directorate of Transport Port Blair"},
    {"state_code": "DD", "rto_code": "DD-01", "district": "Daman", "city": "Daman", "office_name": "RTO Daman"},
    {"state_code": "LD", "rto_code": "LD-01", "district": "Lakshadweep", "city": "Kavaratti", "office_name": "Transport Directorate Kavaratti"},
]

PLATE_TYPES_DATA: List[Dict] = [
    {
        "type_key": "private",
        "name": "Private / Personal Vehicle",
        "bg_color": "#FFFFFF",
        "text_color": "#000000",
        "border_color": "#D1D5DB",
        "description": "Standard registration plate for privately-owned passenger vehicles (cars, two-wheelers, private SUVs) not used for hire or reward.",
        "vehicle_category": "Personal Cars, Scooters, Motorcycles, Private Jeeps",
        "example": "GJ-01-AB-1234",
        "format_guide": "White reflective background with embossed black alphanumeric characters, blue IND strip on the left with Ashoka Chakra hologram."
    },
    {
        "type_key": "commercial",
        "name": "Commercial / Transport Vehicle",
        "bg_color": "#FFDF00",
        "text_color": "#000000",
        "border_color": "#CA8A04",
        "description": "Mandatory for all vehicles used for commercial transport of passengers or goods (taxis, autorickshaws, buses, freight trucks, delivery vans). Requires commercial permit and driver badge.",
        "vehicle_category": "Taxis, Cabs (Ola/Uber), Trucks, Buses, Autos, Tempo",
        "example": "MH-12-TC-9876",
        "format_guide": "Yellow reflective background with black characters. All transport vehicles must also have front and rear retro-reflective tape."
    },
    {
        "type_key": "ev_private",
        "name": "Electric Vehicle (Private / Personal)",
        "bg_color": "#15803D",
        "text_color": "#FFFFFF",
        "border_color": "#166534",
        "description": "Zero-emission purely battery-operated electric vehicles (BEVs) registered for personal use. Introduced by MoRTH in 2018 to distinguish EVs for parking and toll concessions.",
        "vehicle_category": "Personal EVs (Tata Nexon EV, MG ZS EV, Ather, Ola Electric)",
        "example": "DL-01-EV-5678",
        "format_guide": "Lush green retro-reflective background with white embossed characters and IND blue strip."
    },
    {
        "type_key": "ev_commercial",
        "name": "Electric Vehicle (Commercial / Fleet)",
        "bg_color": "#15803D",
        "text_color": "#FACC15",
        "border_color": "#166534",
        "description": "Commercial electric vehicles operated for ride-hailing fleets, electric city buses, commercial goods delivery, and electric cargo 3-wheelers.",
        "vehicle_category": "Fleet EVs (BluSmart, EV Taxis, Electric DTC/BEST Buses, EV Cargo)",
        "example": "KA-01-ET-2468",
        "format_guide": "Green retro-reflective background with vibrant yellow characters."
    },
    {
        "type_key": "government",
        "name": "Government & State Official Vehicle",
        "bg_color": "#FFFFFF",
        "text_color": "#000000",
        "border_color": "#94A3B8",
        "description": "Vehicles owned and operated by Central/State Governments, Ministries, or Municipal Corporations. State transport corporation buses often follow dedicated state series (e.g. GJ-18-Y or MH-14-BT).",
        "vehicle_category": "Govt Staff Cars, Police Vehicles, State Road Transport Buses",
        "example": "GJ-18-G-0001",
        "format_guide": "White plate with black characters, typically with 'G' or 'GOVT' designated series. Official cars may feature Ashoka Stambh / State seal crests."
    },
    {
        "type_key": "diplomatic",
        "name": "Diplomatic & Foreign Mission",
        "bg_color": "#0284C7",
        "text_color": "#FFFFFF",
        "border_color": "#0369A1",
        "description": "Vehicles allocated to foreign embassies, high commissions, and international United Nations organizations. Numbering prefix indicates the foreign mission country code (e.g., 77 CD denotes diplomatic mission).",
        "vehicle_category": "Ambassador Cars, High Commission Fleet, UN Bodies",
        "example": "77 CD 01",
        "format_guide": "Light sky-blue background with white lettering. Formats include 'CD' (Corps Diplomatique), 'CC' (Corps Consulaire), or 'UN' (United Nations)."
    },
    {
        "type_key": "temporary",
        "name": "Temporary Registration",
        "bg_color": "#FACC15",
        "text_color": "#DC2626",
        "border_color": "#CA8A04",
        "description": "Issued by automobile dealerships when a brand new vehicle is purchased before permanent RTO registration is finalized. Valid for a maximum of 30 days.",
        "vehicle_category": "Brand new cars/bikes in transit from dealership to permanent RTO",
        "example": "GJ-TEMP-2024-1234",
        "format_guide": "Yellow background with bold red characters, or red background with white characters indicating temporary transit permit."
    },
    {
        "type_key": "bh_series",
        "name": "Bharat Series (BH Series)",
        "bg_color": "#FFFFFF",
        "text_color": "#000000",
        "border_color": "#475569",
        "description": "Introduced under CMVR in September 2021 for defense personnel, Central/State government employees, and private company employees with offices in 4+ states. Eliminates road tax and re-registration paperwork when relocating across states.",
        "vehicle_category": "Pan-India transferable vehicles for eligible multi-state personnel",
        "example": "24 BH 1234 AA",
        "format_guide": "Format: [YY BH #### XX] -> 2-digit Year of registration + 'BH' (Bharat) + 4 randomized digits (0001-9999) + 2 serial alphabets (AA to ZZ)."
    },
    {
        "type_key": "defence",
        "name": "Defence & Military Vehicle",
        "bg_color": "#0F172A",
        "text_color": "#FFFFFF",
        "border_color": "#334155",
        "description": "Special military vehicle registration system administered by the Ministry of Defence. Uses a broad upward arrow (Broad Arrow, a military heraldic mark) to prevent operational logistics espionage.",
        "vehicle_category": "Indian Army, Indian Navy, Indian Air Force tactical and logistic vehicles",
        "example": "↑ 22 B 123456 X",
        "format_guide": "Black/military matte background with white letters. Begins with an upward arrow '↑' followed by two-digit procurement year, vehicle class code, and serial number."
    }
]

def seed_rto_data(db):
    """Seed states, RTO offices, and plate types into the database."""
    from app.models.rto import State, RTOOffice, PlateType

    # Check if states already exist
    existing_states = db.query(State).count()
    if existing_states == 0:
        print("[INFO] Seeding Indian States and Union Territories...")
        state_code_to_obj = {}
        for s in STATES_DATA:
            state = State(
                name=s["name"],
                code=s["code"],
                type=s["type"],
                capital=s["capital"],
                zone=s["zone"],
                example_plate=s["example_plate"],
                total_rtos=0
            )
            db.add(state)
            state_code_to_obj[s["code"]] = state
        db.commit()

        # Re-query states to get IDs
        states_in_db = {s.code: s for s in db.query(State).all()}

        print("[INFO] Seeding verified RTO offices...")
        rto_count_by_state = {}
        for rto in RTO_OFFICES_DATA:
            st = states_in_db.get(rto["state_code"])
            if st:
                office = RTOOffice(
                    state_id=st.id,
                    state_code=st.code,
                    rto_code=rto["rto_code"],
                    district=rto["district"],
                    city=rto["city"],
                    office_name=rto["office_name"],
                    example_plate=f"{rto['rto_code']}-AB-1234"
                )
                db.add(office)
                rto_count_by_state[st.code] = rto_count_by_state.get(st.code, 0) + 1
        db.commit()

        # Update total_rtos count on states
        for code, count in rto_count_by_state.items():
            st = states_in_db.get(code)
            if st:
                st.total_rtos = count
        db.commit()

    # Check plate types
    existing_plates = db.query(PlateType).count()
    if existing_plates == 0:
        print("[INFO] Seeding Indian Vehicle Plate Categories...")
        for p in PLATE_TYPES_DATA:
            plate_type = PlateType(
                type_key=p["type_key"],
                name=p["name"],
                bg_color=p["bg_color"],
                text_color=p["text_color"],
                border_color=p["border_color"],
                description=p["description"],
                vehicle_category=p["vehicle_category"],
                example=p["example"],
                format_guide=p["format_guide"]
            )
            db.add(plate_type)
        db.commit()
