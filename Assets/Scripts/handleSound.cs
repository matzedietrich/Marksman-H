using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class handleSound : MonoBehaviour
{
    private Rigidbody rb;
    private Vector3 rotation;
    private Vector3 lastRotation;
    private Vector3 rotationSpeed;

    private AudioSource[] sounds;

    private AudioSource hum;


    private AudioSource move;


    // Start is called before the first frame update
    void Start()
    {
        sounds = GetComponents<AudioSource>();
        hum = sounds[1];
        move = sounds[0];
        rb = GetComponent<Rigidbody>();
        rotation = transform.rotation * Vector3.up;
    }

    // Update is called once per frame
    void Update()
    {
        lastRotation = transform.rotation * Vector3.up;
        rotationSpeed = lastRotation - rotation;
        Vector3 v3Velocity = rb.velocity;
        rotation = transform.rotation * Vector3.up;
        move.volume = rotationSpeed.magnitude*4;
    }
}
