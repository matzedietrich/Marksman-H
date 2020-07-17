using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public static class playerStats
{

    private static int experience;
    public static int Experience 
    {
        get 
        {
            return experience;
        }
        set 
        {
            experience = value;
        }
    }

}
