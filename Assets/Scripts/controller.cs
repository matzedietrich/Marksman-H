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
                print(">> " + text);

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
        if (jump == true)
        {
            Jump();
            jump = false;
        }
    }

}
