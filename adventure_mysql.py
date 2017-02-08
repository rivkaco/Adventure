import pymysql

connection = pymysql.connect(
    host='sql6.freesqldatabase.com',
    user='sql6157858',
    password='btRTYSfVyQ',
    db='sql6157858',
    charset='utf8',
    port=3306,
    cursorclass=pymysql.cursors.DictCursor)

def find_user_id(username):
    with connection.cursor() as cursor:
        sql = "SELECT username FROM users WHERE username ='{}'".format(username)
        cursor.execute(sql)
        result = cursor.fetchone()
        if result is None:
            create_user(username)
        return fetch_user_id(username)


def create_user(username):
    with connection.cursor() as cursor:
        sql = "INSERT INTO users (username) VALUE('{}')".format(username)
        cursor.execute(sql)

def fetch_user_id(username):
    with connection.cursor() as cursor:
        sql = "SELECT id FROM users WHERE username='{}'".format(username)
        cursor.execute(sql)
        result = cursor.fetchone()
        return result['id']

# def load_story(user_id,adventure_id):

