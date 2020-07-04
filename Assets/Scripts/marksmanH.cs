using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class marksmanH : MonoBehaviour
{


    [SerializeField] private Transform laserProjectile;
    public GameObject FlyingArea;

    public GameObject PlayerBody;


    float minX;
    float maxX;

    float minY;
    float maxY;

    float minZ;

    float maxZ;

    public float speed = 1.0f;

    public float minTimeBetweenShooting = 2f;
    public float maxTimeBetweenShooting = 5f;





    private Vector3 nextLocation;

    private Vector3 velocity = Vector3.zero;




    private Rigidbody rb;


    // Start is called before the first frame update
    void Start()
    {

        InvokeRepeating("Shoot", 2.0f, 1.0f);
        StartCoroutine("Shoot");


        rb = GetComponent<Rigidbody>();
        minX = FlyingArea.transform.position.x - FlyingArea.transform.localScale.x / 2;
        maxX = FlyingArea.transform.position.x + FlyingArea.transform.localScale.x / 2;
        minY = FlyingArea.transform.position.y - FlyingArea.transform.localScale.y / 2;
        maxY = FlyingArea.transform.position.y + FlyingArea.transform.localScale.y / 2;
        minZ = FlyingArea.transform.position.z - FlyingArea.transform.localScale.z / 2;
        maxZ = FlyingArea.transform.position.z + FlyingArea.transform.localScale.z / 2;

        nextLocation = createRandomLocation();

    }

    void Update()
    {
        float step = speed * Time.deltaTime;
        //transform.position = Vector3.MoveTowards(transform.position, nextLocation, step);
        transform.position = Vector3.SmoothDamp(transform.position, nextLocation, ref velocity, 2.0f);

        //rb.AddForce((nextLocation - transform.position) * speed);



        print(Vector3.Distance(transform.position, nextLocation));

        //print(rb.velocity);


        if (Vector3.Distance(transform.position, nextLocation) < 3.0f)
        {
            nextLocation = createRandomLocation();
        }

    }


    IEnumerator Shoot()
    {
        yield return new WaitForSeconds(Random.Range(minTimeBetweenShooting, maxTimeBetweenShooting));
        while (true)
        {
            Transform projectileTransform = Instantiate(laserProjectile, transform.position, Quaternion.identity);
            Vector3 randomVariation = new Vector3(0f, Random.Range(-1.0f, 1.0f), 0f);
            Vector3 variedShootPosition = PlayerBody.transform.position + randomVariation;
            Vector3 shootDir = (variedShootPosition - transform.position).normalized;
            projectileTransform.GetComponent<laserProjectile>().Setup(shootDir);
            yield return new WaitForSeconds(Random.Range(minTimeBetweenShooting, maxTimeBetweenShooting));
        }
    }

    public Vector3 createRandomLocation()
    {
        Vector3 location = new Vector3(
        Random.Range(minX, maxX),
        Random.Range(minY, maxY),
        Random.Range(minZ, maxZ)

    );
        print("location:" + location);
        return location;
    }



}
