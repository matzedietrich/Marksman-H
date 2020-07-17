using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class changePosition : MonoBehaviour
{

    public GameObject controller;

    private Vector3 initPos;

    private float x;
    private Vector3 addPosition;
    // Start is called before the first frame update
    void Start()
    {
        initPos = transform.position;
    }

    // Update is called once per frame
    void Update()
    {
        x = controller.transform.position.x;
        Vector3 zeroVector = new Vector3(0, 0, 0);
        addPosition = new Vector3(x, 0, 0)/2;
        Vector3 setPosition = initPos + zeroVector + addPosition;
        transform.position = setPosition;
    }

}
