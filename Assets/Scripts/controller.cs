﻿using UnityEngine;
using System;
using System.Collections;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Globalization;
public class controller : MonoBehaviour
{
    Thread receiveThread;

    private BoxCollider bc;

    UdpClient client;
    int port;

    int startX;

    int startY;

    int endX;

    int endY;

    public int maxXMovement = 3;
    public int maxYMovement = 2;


    float angle;

    float zAngle;

    float xPos;


    float yPos;


    Vector3 startPoint;

    Vector3 endPoint;


    Vector3 startPosition;



    void Start()
    {
        port = 5065;
        startPosition = transform.position;
        bc = GetComponent<BoxCollider>();
        InitUDP();
    }

    private void InitUDP()
    {
        receiveThread = new Thread(new ThreadStart(ReceiveData)); //1 
        receiveThread.IsBackground = true; //2
        receiveThread.Start(); //3
    }

    private void ReceiveData()
    {
        client = new UdpClient(port);
        IPEndPoint anyIP = new IPEndPoint(IPAddress.Parse("0.0.0.0"), port);

        while (true)
        {
            try
            {
                byte[] data = client.Receive(ref anyIP);
                string text = Encoding.UTF8.GetString(data);


                string[] splitString = text.Split('/');


                float degrees = (data[0] * 2) - 180;
                angle = degrees;

                float relativeXPos = ((data[1] - 100) / 100f);
                xPos = relativeXPos;

                float relativeYPos = ((data[2] - 100) / 100f);
                yPos = relativeYPos;

                float zDegrees = data[3];
                zAngle = zDegrees;



            }
            catch (Exception e)
            {
                print(e.ToString());
            }
        }
    }



    void Update()
    {
        transform.rotation = Quaternion.Euler(zAngle, 0, angle);
        transform.position = (new Vector3(xPos, yPos, 0)) + startPosition;
    }

}
