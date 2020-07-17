using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
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
            this.reduceHealth(10);
        }
    }

    private void reduceHealth(int health){
        lp -= health;
        healthbar.reduceHealth(lp);
        if(lp <= 0){
            GetComponent<loader>().switchScene("GameOver");
        }
    }


}
