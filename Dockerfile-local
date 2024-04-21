FROM arm64v8/debian:bookworm-slim

ADD https://github.com/ultralytics/assets/releases/download/v0.0.0/Arial.ttf \
    https://github.com/ultralytics/assets/releases/download/v0.0.0/Arial.Unicode.ttf \
    /root/.config/Ultralytics/

RUN apt update \
    && apt install --no-install-recommends -y python3-pip git zip curl htop gcc libgl1 libglib2.0-0 libpython3-dev gnupg g++ libusb-1.0-0 build-essential

WORKDIR /usr/src/ultralytics

RUN git clone https://github.com/ultralytics/ultralytics -b main /usr/src/ultralytics
ADD https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8n.pt /usr/src/ultralytics/

RUN rm -rf /usr/lib/python3.11/EXTERNALLY-MANAGED

RUN python3 -m pip install --upgrade pip wheel
RUN pip install --no-cache -e ".[export]"

RUN ln -sf /usr/bin/python3 /usr/bin/python

COPY . /usr/src/ultralytics

RUN pip install -r requirements.txt

ENV FLASK_APP=app.py

EXPOSE 8080

CMD ["python", "app.py"]
