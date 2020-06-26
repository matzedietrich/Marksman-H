using UnityEngine;
using System;
using System.Collections;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
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


    float angle;


    Vector3 startPoint;

    Vector3 endPoint;



    

    // 2. Initialize variables
    void Start()
    {
        port = 5065; //1 
        jump = false; //2 

        InitUDP(); //4
    }

    // 3. InitUDP
    private void InitUDP()
    {
        print("UDP Initialized");

        receiveThread = new Thread(new ThreadStart(ReceiveData)); //1 
        receiveThread.IsBackground = true; //2
        receiveThread.Start(); //3
    }

    // 4. Receive Data
    private void ReceiveData()
    {
        client = new UdpClient(port); //1
        while (true) //2
        {
            try
            {
                IPEndPoint anyIP = new IPEndPoint(IPAddress.Parse("0.0.0.0"), port); //3
                byte[] data = client.Receive(ref anyIP); //4

                string text = Encoding.UTF8.GetString(data); //5

                if (text.StartsWith("start:")) 
                {
                    string startValue = text.Split(':')[1];
                    startX = int.Parse(startValue.Split(',')[0].Remove(0,1));
                    startY = int.Parse(startValue.Split(',')[1].Remove(startValue.Split(',')[1].Length - 1));
                    startPoint = new Vector3(startX, startY, 1);
                }

                if (text.StartsWith("end:")) 
                {
                    string endValue = text.Split(':')[1];
                    endX = int.Parse(endValue.Split(',')[0].Remove(0,1));
                    endY = int.Parse(endValue.Split(',')[1].Remove(endValue.Split(',')[1].Length - 1));
                    endPoint = new Vector3(endX, endY, 1);
                }

                angle = Vector3.Angle(startPoint, endPoint);
                print("startpoint:" + startPoint.ToString() + " endpoint:" + endPoint.ToString());
                //print("end:" + endPoint.ToString());


                jump = true; //6

            }
            catch (Exception e)
            {
                print(e.ToString()); //7
            }
        }
    }

    // 5. Make the Player Jump

    public void Jump()
    {
        transform.position = new Vector3(1, 1, 0);
    }

    // 6. Check for variable value, and make the Player Jump!
    void Update()
    {

        transform.rotation = Quaternion.Euler(0, 0, angle); 

        if (jump == true)
        {
            Jump();
            jump = false;
        }
    }

}
