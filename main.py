from bottle import route, run, template, static_file, request
import random
import json
#This is importing our file with our MySQL queries/modifications.
import adventure_mysql as adventure


@route("/", method="GET")
def index():
    return template("adventure.html")


@route("/start", method="POST")
def start():
    username = request.POST.get("user")
    current_adv_id = request.POST.get("adventure_id")
    user_id = adventure.find_user_id(username)
    current_story_id = adventure.load_story(user_id, current_adv_id)
    question = adventure.get_question(current_adv_id,current_story_id)
    image = question['picture_name']+'.jpg'
    current_story_id = adventure.load_story(user_id, current_adv_id)
    next_steps_results = adventure.get_options(current_adv_id, current_story_id)

    return json.dumps({"user": user_id,
                       "adventure": current_adv_id,
                       "current": current_story_id,
                       "text": question['question_text'],
                       "image": image,
                       "options": next_steps_results
                       })


@route("/story", method="POST")
def story():
    user_id = request.POST.get("user")
    current_adv_id = request.POST.get("adventure")
    next_story_id = request.POST.get("next") #this is what the user chose - use it!

    next_steps_results =2

    #todo add the next step based on db
    return json.dumps({"user": user_id,
                       "adventure": current_adv_id,
                       "text": "New scenario! What would you do?",
                       "image": "choice.jpg",
                       "options": next_steps_results
                       })

@route('/js/<filename:re:.*\.js$>', method='GET')
def javascripts(filename):
    return static_file(filename, root='js')


@route('/css/<filename:re:.*\.css>', method='GET')
def stylesheets(filename):
    return static_file(filename, root='css')


@route('/images/<filename:re:.*\.(jpg|png|gif|ico)>', method='GET')
def images(filename):
    return static_file(filename, root='images')

def main():
    run(host='localhost', port=9000)

if __name__ == '__main__':
    main()

