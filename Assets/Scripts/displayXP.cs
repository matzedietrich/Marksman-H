using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class displayXP : MonoBehaviour
{
    public int xp = 0;
    
    void start(){
        setXP(0);
    }

    public Text xpText;
    public void setXP(int setXP){
        xp = setXP;
        xpText.text = xp.ToString();
        playerStats.Experience = xp;
    }    
    public void addXP(int addedXP){
        xp += addedXP;
        setXP(xp);
    }
}
