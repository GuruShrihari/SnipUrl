import secrets # Works exactly the same as random , but is commonly used for genrating unpredictable tokens


CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
def generate_short_code():
    code =""
    
    for _ in range(6):
        code += secrets.choice(CHARS)
    
    return code


if __name__ == "__main__":
    x = generate_short_code()
    print(x)
    