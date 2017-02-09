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
        connection.commit()

def fetch_user_id(username):
    with connection.cursor() as cursor:
        sql = "SELECT id FROM users WHERE username='{}'".format(username)
        cursor.execute(sql)
        result = cursor.fetchone()
        return result['id']


def load_story(user_id,adventure_id):
    with connection.cursor() as cursor:
        sql ="SELECT user_id FROM adventures WHERE user_id={}".format(user_id)
        cursor.execute(sql)
        result = cursor.fetchone()
        if result is None:
            add_user_adventure(user_id,adventure_id)
        return get_step(user_id,adventure_id)

def add_user_adventure(user_id,adventure_id):
    with connection.cursor() as cursor:
        sql ="INSERT INTO adventures (user_id,adventure) VALUES({0},{1})".format(user_id,adventure_id)
        cursor.execute(sql)
        connection.commit()

def get_step(user_id,adventure_id):
    with connection.cursor() as cursor:
        sql = "SELECT step FROM adventures WHERE user_id={0} AND adventure ={1}".format(user_id,adventure_id)
        cursor.execute(sql)
        result = cursor.fetchone()
        return result['step']

def get_options (adventure_id, step_id):
    with connection.cursor() as cursor:
        sql = "select next_question, option_text from options WHERE story_id = {0} AND q_id = {1}".format(adventure_id, step_id)
        cursor.execute(sql)
        result = cursor.fetchall()
        return result

def get_question(current_adv_id,current_story_id):
    with connection.cursor() as cursor:
        sql = "SELECT question_text,picture_name FROM scenes WHERE story_id={0} and q_id={1}".format(current_adv_id,current_story_id)
        cursor.execute(sql)
        result = cursor.fetchone()
        return result

print(get_options(1,2))