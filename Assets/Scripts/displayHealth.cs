using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class displayHealth : MonoBehaviour
{
    public Slider slider;

    public Image ouch;

    public Image current;


    private Color temp;

    public void setMaxHealth(int health)
    {
        slider.maxValue = health;
        slider.value = health;
    }

    public void addHealth(int health)
    {
        this.setHealth(health);
    }

    public void reduceHealth(int health)
    {
        this.setHealth(health);
        temp = ouch.color;
        temp.a = 1.0f;
        ouch.color = temp;
        current.color = new Color(1.0f,0.0f,0.0f,1.0f);
        StartCoroutine(removeDamageImage());
    }

    public void setHealth(int health)
    {
        slider.value = health;
    }


    IEnumerator removeDamageImage()
    {
        yield return new WaitForSeconds(1);
        temp.a = 0.0f;
        current.color = new Color(1.0f,1.0f,1.0f,1.0f);
        ouch.color = temp;
    }



}
