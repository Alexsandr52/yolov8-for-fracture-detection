import os
import cv2
import numpy as np
from ultralytics import YOLO
from flask import Flask, request, jsonify

# docker build -t yolo-flask-app .
# docker run -d -p 8080:8080 yolo-flask-app 
# curl -X POST -F "file=@IMG0001780.jpg" http://localhost:8080/predict

model = YOLO('runs/detect/train/weights/best.pt')
model_2 = YOLO('runs/detect/train/weights/classif/last (1).pt')
app = Flask(__name__)

ALLOWED_EXTENSIONS = {'jpg', 'jpeg'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return '''Author: Alexander Polyansky\n Title: Flask server with Yolov8\n Description: This is simple flask server with one method [post] "predict". \n Input data must be img file. Response will be json with coordinates or error message.'''

def predict_part(image):
        res = model_2(image)
        return res

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files: return jsonify({'error': 'No file provided'})
        
        file = request.files['file']
        
        if file.filename == '': return jsonify({'error': 'No selected file'})
        if not allowed_file(file.filename): return jsonify({'error': 'Invalid file type'})
        
        np_image = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(np_image, cv2.IMREAD_COLOR)
        
        res = model(image)
        res2 = predict_part(image)

        res = res[0].boxes.xywh.numpy()
        res2 = res2[0].probs.top1

        return jsonify({'boxes': res.tolist(), 'results': res2})
    except Exception as e:
        return jsonify({'error': e})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)