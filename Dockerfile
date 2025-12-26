# Ultralytics YOLO 🚀, AGPL-3.0 license
# Builds ultralytics/ultralytics:latest-cpu image on DockerHub https://hub.docker.com/r/ultralytics/ultralytics
# Image is CPU-optimized for ONNX, OpenVINO and PyTorch YOLOv8 deployments

# Start FROM Ubuntu image https://hub.docker.com/_/ubuntu
FROM ubuntu:24.04

# Downloads to user config dir
ADD https://github.com/ultralytics/assets/releases/download/v0.0.0/Arial.ttf \
    https://github.com/ultralytics/assets/releases/download/v0.0.0/Arial.Unicode.ttf \
    /root/.config/Ultralytics/

# Install linux packages
# g++ required to build 'tflite_support' and 'lap' packages, libusb-1.0-0 required for 'tflite_support' package
RUN apt update \
    && apt install --no-install-recommends -y python3-pip git zip curl htop libgl1 libglib2.0-0 libpython3-dev gnupg g++ libusb-1.0-0

# Create working directory
WORKDIR /usr/src/ultralytics

# Copy contents
# COPY . /usr/src/ultralytics  # git permission issues inside container
RUN git clone https://github.com/ultralytics/ultralytics -b main /usr/src/ultralytics
ADD https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8n.pt /usr/src/ultralytics/

# Remove python3.12/EXTERNALLY-MANAGED to allow pip installs
RUN rm -rf /usr/lib/python3.12/EXTERNALLY-MANAGED

# Manually remove broken debian pip/wheel files, then reinstall fresh
RUN rm -rf /usr/lib/python3/dist-packages/pip* /usr/lib/python3/dist-packages/wheel* \
    /usr/local/lib/python3.12/dist-packages/pip* /usr/local/lib/python3.12/dist-packages/wheel* \
    && curl -sS https://bootstrap.pypa.io/get-pip.py | python3
RUN pip install --no-cache -e ".[export]" --extra-index-url https://download.pytorch.org/whl/cpu --break-system-packages


RUN rm -rf tmp

# Creates a symbolic link to make 'python' point to 'python3'
RUN ln -sf /usr/bin/python3 /usr/bin/python


COPY . /usr/src/ultralytics

RUN pip install -r requirements.txt --break-system-packages

ENV FLASK_APP=app.py

EXPOSE 8080

CMD ["python", "app.py"]
