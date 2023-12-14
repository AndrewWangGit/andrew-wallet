from google.oauth2 import id_token
from google.auth.transport import requests

# (Receive token by HTTPS POST)
# ...

# try:
token = "ya29.a0AfB_byDBoegAFePq2qGegIJ-JR0Hr0rFXYrzEW3xxxooCPEbSNet-AgeGorE98eElzgfzrHfxLrZjW2Wb40YEi6ULcqo31cd5U8dWybryuelz35LuSBBsPUjwLoDKbqQ0JooLmtxKwBMiD0VwxbXGrMFfqPAVixbQOTWaCgYKAYgSARESFQHGX2MiK-iCQEpidV7TJ_uSBk43qQ0171"
CLIENT_ID = (
    "629075145814-0il5ad9dgklad6olnla10nebnqc5n2uj.apps.googleusercontent.com"
)
print("here")
# Specify the CLIENT_ID of the app that accesses the backend:
idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
print(idinfo)

# Or, if multiple clients access the backend server:
# idinfo = id_token.verify_oauth2_token(token, requests.Request())
# if idinfo['aud'] not in [CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]:
#     raise ValueError('Could not verify audience.')

# If auth request is from a G Suite domain:
# if idinfo['hd'] != GSUITE_DOMAIN_NAME:
#     raise ValueError('Wrong hosted domain.')

# ID token is valid. Get the user's Google Account ID from the decoded token.
userid = idinfo["sub"]
print(userid)
# except ValueError:
#     # Invalid token
#     print("Invalid token")
#     pass
