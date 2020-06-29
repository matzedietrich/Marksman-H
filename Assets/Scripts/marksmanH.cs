using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class marksmanH : MonoBehaviour
{

    public GameObject FlyingArea;


    float minX;
    float maxX;

    float minY;
    float maxY;

    float minZ;

    float maxZ;

    public float speed = 2.0f;



    private Vector3 nextLocation;



    private Rigidbody rb;


    // Start is called before the first frame update
    void Start()
    {
        rb = GetComponent<Rigidbody>();
        minX = FlyingArea.transform.position.x - FlyingArea.transform.localScale.x / 2;
        maxX = FlyingArea.transform.position.x + FlyingArea.transform.localScale.x / 2;
        minY = FlyingArea.transform.position.y - FlyingArea.transform.localScale.y / 2;
        maxY = FlyingArea.transform.position.y + FlyingArea.transform.localScale.y / 2;
        minZ = FlyingArea.transform.position.z - FlyingArea.transform.localScale.z / 2;
        maxZ = FlyingArea.transform.position.z + FlyingArea.transform.localScale.z / 2;
 
        nextLocation = createRandomLocation();
    }

    void Update()    {
        float step = speed;
        //transform.position = Vector3.MoveTowards(transform.position, nextLocation, step);
        rb.AddForce((nextLocation - transform.position)*speed);


        print(Vector3.Distance(transform.position, nextLocation));

        if (Vector3.Distance(transform.position, nextLocation) < 7.0f)
        {
            nextLocation = createRandomLocation();
        }

    }

    void Shoot() {
        
    }


    public Vector3 createRandomLocation()
    {
        Vector3 location = new Vector3(
        Random.Range(minX, maxX),
        Random.Range(minY, maxY),
        Random.Range(minZ, maxZ)
    );
        //print("calculating new location");
        return location;
    }


}
