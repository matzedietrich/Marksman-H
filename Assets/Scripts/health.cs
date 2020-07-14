using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class health : MonoBehaviour
{
    public int lp = 100;
    public int maxLp = 100;

    public displayHealth healthbar;
    // Start is called before the first frame update
    void Start()
    {
        lp = maxLp;
        healthbar.setMaxHealth(maxLp);

    }

    // Update is called once per frame
    void Update()
    {

    }


    private void OnTriggerEnter(Collider other)
    {
        if (other.gameObject.tag == "laserProjectile")
        {
            lp -= 10;
            print(lp);
            healthbar.setHealth(lp);
        }
    }
}
