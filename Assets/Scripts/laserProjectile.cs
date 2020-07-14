using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class laserProjectile : MonoBehaviour
{

    public GameObject xpBar;

    public displayXP xp;
    private AudioSource[] sounds;
    private AudioSource reflect;

    private AudioSource shot;
    // Start is called before the first frame update
    private Vector3 shootDir;
    public void Setup(Vector3 shootDir)
    {
        sounds = GetComponents<AudioSource>();
        reflect = sounds[0];
        shot = sounds[1];
        this.shootDir = shootDir;
        transform.rotation = Quaternion.LookRotation(shootDir);
        Destroy(gameObject, 5f);
    }

    private void OnTriggerEnter(Collider other)
    {
        if (other.gameObject.tag == "Lightsaber")
        {
            getReflected();
        }
    }

    public static float getAngleFromVectorFloat(Vector3 dir)
    {
        dir = dir.normalized;
        float n = Mathf.Atan2(dir.y, dir.x) * Mathf.Rad2Deg;
        if (n < 0) n += 360;

        return n;
    }
    void Start()
    {
         xpBar = GameObject.Find("XP");
         xp = xpBar.GetComponent<displayXP>();
        shot.Play();
    }

    // Update is called once per frame
    void Update()
    {
        float moveSpeed = 25f;
        transform.position += shootDir * moveSpeed * Time.deltaTime;
    }

    void getReflected()
    {
        print("reflected");
        this.shootDir = this.shootDir * -1;
        xp.addXP(25);
        reflect.Play();
    }
}
