from flask import Flask, request, jsonify, render_template  # type: ignore
from flask_cors import CORS  # type: ignore
from pymongo import MongoClient  # type: ignore
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests

# MongoDB Configuration
MONGO_URI = "mongodb+srv://Pavani:gJVaqefRlZscnaki@cluster0.kmxins0.mongodb.net/speech_to_text?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client['speech_to_text']  # Database name
collection = db['transcriptions']  # Collection name

# Route for homepage
@app.route('/')
def home():
    return render_template('home.html')

# Route for speech-to-text page
@app.route('/speech')
def speech():
    return render_template('speech.html')

# API endpoint to save transcription
@app.route('/save-transcription', methods=['POST'])
def save_transcription():
    try:
        # Log that a request was received
        print("Request received to save transcription")

        # Parse JSON data from the request body
        data = request.get_json()
        if not data:
            print("No JSON data received")
            return jsonify({"message": "Invalid request, no data provided"}), 400

        print(f"Parsed JSON data: {data}")
        transcription_text = data.get('transcription', '').strip()

        if not transcription_text:
            print("No transcription text provided")
            return jsonify({"message": "Transcription text is required"}), 400

        # Save to MongoDB
        print("Attempting to save transcription to MongoDB")
        result = collection.insert_one({
            "content": transcription_text,
            "createdAt": datetime.utcnow()  # Use UTC for consistent timestamps
        })
        print(f"Transcription saved with ID: {result.inserted_id}")

        return jsonify({
            "message": "Transcription saved successfully",
            "id": str(result.inserted_id)
        })
    except Exception as e:
        # Log detailed error for debugging
        print(f"Error saving transcription: {e}")
        return jsonify({"message": "Failed to save transcription due to server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
