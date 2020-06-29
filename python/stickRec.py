# import the necessary packages
from collections import deque
from imutils.video import VideoStream
import numpy as np
from cv2 import cv2
import imutils
import time
import math
import socket



UDP_IP = "127.0.0.1"
UDP_PORT = 5065

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

last = []

# define the lower and upper boundaries of the "green"
# ball in the HSV color space, then initialize the
# list of tracked points
greenLower = (29, 86, 6)
greenUpper = (64, 255, 255)
redLower = (0, 0, 74)
redUpper = (255, 30, 255)
pts = deque(maxlen=2)
# if a video path was not supplied, grab the reference
# to the webcam
cap = cv2.VideoCapture(0)
frameWidth = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
# allow the camera or video file to warm up
frameHeight = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
time.sleep(2.0)

while True:
    success, img = cap.read()
    blurred = cv2.GaussianBlur(img, (11, 11), 0)
    hsv = cv2.cvtColor(blurred, cv2.COLOR_BGR2HSV)

    greenMask = cv2.inRange(hsv, greenLower, greenUpper)
    greenMask = cv2.erode(greenMask, None, iterations=2)
    greenMask = cv2.dilate(greenMask, None, iterations=2)

    redMask = cv2.inRange(blurred, redLower, redUpper)
    redMask = cv2.erode(redMask, None, iterations=2)
    redMask = cv2.dilate(redMask, None, iterations=2)



    greenCnts = cv2.findContours(greenMask.copy(), cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE)
    greenCnts = imutils.grab_contours(greenCnts)
    greenCenter = None
    # only proceed if at least one contour was found
    if len(greenCnts) > 0:
        # find the largest contour in the mask, then use
        # it to compute the minimum enclosing circle and
        # centroid
        gc = max(greenCnts, key=cv2.contourArea)
        ((x, y), greenRadius) = cv2.minEnclosingCircle(gc)
        gM = cv2.moments(gc)
        greenCenter = (int(gM["m10"] / gM["m00"]), int(gM["m01"] / gM["m00"]))
        # only proceed if the radius meets a minimum size
            # draw the circle and centroid on the frame,
            # then update the list of tracked points
        cv2.circle(img, (int(x), int(y)), int(greenRadius),
            (0, 255, 0), 2)
        cv2.circle(img, greenCenter, 5, (0, 255, 0), -1)
    # update the points queue
    pts.appendleft(greenCenter)


    

    redCnts = cv2.findContours(redMask.copy(), cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE)
    redCnts = imutils.grab_contours(redCnts)
    redCenter = None
    # only proceed if at least one contour was found
    if len(redCnts) > 0:
        # find the largest contour in the mask, then use
        # it to compute the minimum enclosing circle and
        # centroid
        rc = max(redCnts, key=cv2.contourArea)
        ((x, y), redRadius) = cv2.minEnclosingCircle(rc)
        rM = cv2.moments(rc)
        redCenter = (int(rM["m10"] / rM["m00"]), int(rM["m01"] / rM["m00"]))
        # only proceed if the radius meets a minimum size
            # draw the circle and centroid on the frame,
            # then update the list of tracked points
        cv2.circle(img, (int(x), int(y)), int(redRadius),
            (255, 0, 0), 2)
        cv2.circle(img, redCenter, 5, (255, 0, 0), -1)
    pts.appendleft(redCenter)

    if (pts[0] is not None) and (pts[1] is not None):
        cv2.line(img,pts[0],pts[1],(255,0,0),8)

        XPos = pts[0][0]
        relativeXPos = ((frameWidth/2)-XPos)/(frameWidth/2)
        #print(relativeXPos)


        YPos = pts[0][1]
        relativeYPos = ((frameHeight/1.5)-YPos)/(frameHeight/2)
        #print(relativeYPos)


        #print("RR:"+str(redRadius)+"  GR:"+str(greenRadius))

        startZ = round(redRadius,2)
        endZ = round(greenRadius,2)

        zRadians = (startZ - endZ)
        print(zRadians)


        myradians = math.atan2(pts[0][0]-pts[1][0], pts[0][1]-pts[1][1])
        mydegrees = round(math.degrees(myradians)*(-1), 2)

        sock.sendto( ("d:"+str(mydegrees)).encode(), (UDP_IP, UDP_PORT) )
        sock.sendto( ("x:"+str(relativeXPos)).encode(), (UDP_IP, UDP_PORT) )
        sock.sendto( ("y:"+str(relativeYPos)).encode(), (UDP_IP, UDP_PORT) )
        sock.sendto( ("z:"+str(endZ)).encode(), (UDP_IP, UDP_PORT) )





        #sock.sendto( ("start:"+str(pts[0])).encode(), (UDP_IP, UDP_PORT) )
        #sock.sendto( ("end:"+str(pts[1])).encode(), (UDP_IP, UDP_PORT) )




    
    cv2.imshow("Result", img)
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        break
