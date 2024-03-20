# app.py allows us to send data from frontend to backend
from flask import Flask, request, jsonify
from flask_cors import CORS

# from implementation import create_data_json  
# from fileinput import filename
# import pandas as pd
from flask import *
import os
# from werkzeug.utils import secure_filename
# import json
 
UPLOAD_FOLDER = os.path.join('staticFiles', 'uploads')
ALLOWED_EXTENSIONS = {'csv'}

# Starts Flask connection
app = Flask(__name__, '/static')
CORS(app, allow_headers=['Content-Type', 'Access-Control-Allow-Origin'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER # Configure upload file path of messages.csv in flask
app.secret_key = 'smartiesharters'

@app.route('/submit_color', methods=['POST'])
def update_color():
    print("submit_color endpoint called")
    data = request.json
    color = data.get('color')
    date = data.get('date')
    
    with open('data.json', 'r') as file:
        existing_data = json.load(file)
    
    # Check if the date already exists in the JSON data
    date_exists = False
    for entry in existing_data:
        if entry['date'] == date:
            entry['color'] = color
            date_exists = True
            break
    
    # If date doesn't exist, add a new entry
    if not date_exists:
        existing_data.append({'color': color, 'date': date})

    # Write back the updated JSON data to the file
    with open('data.json', 'w') as file:
        json.dump(existing_data, file, indent=4)

    return "Today's Mood Submitted"

if __name__ == '__main__':
    app.run(debug=True)
