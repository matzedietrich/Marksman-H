using UnityEngine;
using System;
using System.Collections;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Globalization;
public class controller : MonoBehaviour
{
    // 1. Declare Variables
    Thread receiveThread; //1
    UdpClient client; //2
    int port; //3

    bool jump; //6


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




    // 2. Initialize variables
    void Start()
    {
        port = 5065; //1 
        jump = false; //2 
        startPosition = transform.position;

        InitUDP(); //4
    }

    // 3. InitUDP
    private void InitUDP()
    {
        //print("UDP Initialized");

        receiveThread = new Thread(new ThreadStart(ReceiveData)); //1 
        receiveThread.IsBackground = true; //2
        receiveThread.Start(); //3
    }

    // 4. Receive Data
    private void ReceiveData()
    {
        client = new UdpClient(port);
        while (true)
        {
            try
            {
                IPEndPoint anyIP = new IPEndPoint(IPAddress.Parse("0.0.0.0"), port);
                byte[] data = client.Receive(ref anyIP);
                //print(data[0]);
                string text = Encoding.UTF8.GetString(data);
               
                //print(text);

                string[] splitString = text.Split('/');
                

                float degrees = (data[0]*2)-180;
                angle = degrees;

                float relativeXPos = ((data[1]-100)/100f);
                xPos = relativeXPos;

                float relativeYPos = ((data[2]-100)/100f);
                yPos = relativeYPos;

                float zDegrees = data[3];
                zAngle = zDegrees;
                


            }
            catch (Exception e)
            {
                print(e.ToString()); //7
            }
        }
    }



    void Update()
    {
        transform.rotation = Quaternion.Euler(zAngle, 0, angle);
        transform.position = (new Vector3(xPos, yPos, 0)) + startPosition;
    }

}
