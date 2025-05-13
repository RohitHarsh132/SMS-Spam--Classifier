from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Load the model and vectorizer
try:
    logger.info("Loading model and vectorizer...")
    with open('spam_classifier.pkl', 'rb') as model_file:
        model = pickle.load(model_file)
    logger.info("Model loaded successfully")

    with open('vectorizer.pkl', 'rb') as vectorizer_file:
        vectorizer = pickle.load(vectorizer_file)
    logger.info("Vectorizer loaded successfully")
except Exception as e:
    logger.error(f"Error loading model or vectorizer: {str(e)}")
    raise

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the SMS text from the request
        data = request.get_json()
        if not data or 'sms' not in data:
            logger.error("No SMS data in request")
            return jsonify({'error': 'No SMS data provided'}), 400

        sms_text = data['sms']
        logger.info(f"Received SMS for prediction: {sms_text[:50]}...")
        
        # Transform the text using the vectorizer
        text_vector = vectorizer.transform([sms_text])
        logger.debug("Text vectorized successfully")
        
        # Make prediction
        prediction = model.predict(text_vector)[0]
        probability = model.predict_proba(text_vector)[0]
        
        # Get the confidence score
        confidence = float(max(probability))
        
        result = {
            'prediction': 'Spam' if prediction == 1 else 'Not Spam',
            'confidence': f'{confidence:.2%}'
        }
        
        logger.info(f"Prediction result: {result}")
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True) 