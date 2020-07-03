using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class laserProjectile : MonoBehaviour
{
    // Start is called before the first frame update
    private Vector3 shootDir;
    public void Setup(Vector3 shootDir)
    {
        this.shootDir = shootDir;
        transform.rotation = Quaternion.LookRotation(shootDir);
        Destroy(gameObject, 5f);

    }

    public static float getAngleFromVectorFloat(Vector3 dir){
        dir = dir.normalized;
        float n = Mathf.Atan2(dir.y, dir.x) * Mathf.Rad2Deg;
        if (n < 0) n += 360;

        return n;
    }
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {
        float moveSpeed = 25f;
        transform.position += shootDir * moveSpeed * Time.deltaTime;

    }
}
