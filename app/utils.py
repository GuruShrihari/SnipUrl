import secrets # Works exactly the same as random , but is commonly used for genrating unpredictable tokens

from sqlmodel import select

from app.models import Url 


CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
def generate_short_code():
    code =""
    
    for _ in range(6):
        code += secrets.choice(CHARS)
    
    return code


def check_duplicate_code(code,session):
    query = select(Url).where(Url.short_code == code)

    existing = session.exec(query).first()
    if existing:
        return True
    else:
        return False
    


if __name__ == "__main__":
    x = generate_short_code()
    print(x)
    