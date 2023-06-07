"use strict";

/*
Mexui Properties:
case 'backgroundColour':
case 'backgroundColor':
case 'textColour':
case 'textColor':
case 'lineColour':
case 'lineColor':
case 'borderColour':
case 'borderColor':

case 'focus':
case 'hover':

case 'transitionTime':
case 'transitionDelay':
*/

let dashboardBackgroundStyle = {
    main: {
        backgroundColour: toColour(0, 0, 255, 50)
    }
}

let dashboardLogoStyle = {
    main: {
        textColour: toColour(218, 128, 0, 255),
        textAlign: 0.5,
        textSize: 32.0,
        textFont: 'Pricedown'
    },
    focus: {
        borderColour: toColour(0, 0, 0, 0)
    }
}

let newsTextStyle = {
    main: {
        textColour: toColour(255, 255, 255, 150),
        backgroundColour: toColour(0, 0, 0, 0),
        textAlign: 0.0,
        textSize: 16.0,
        lineWeight: 2,
        textFont: 'Roboto',
    },
    focused: {
        borderColour: toColour(0, 0, 0, 0)
    }
}

let dashboardWindowStyle = {
    main: {
        //backgroundColour: toColour(0, 0, 0, 100),
        backgroundColour: toColour(0, 0, 255, 20)
        //textColour: toColour(255, 255, 255, 255),
        /*hover: {
            backgroundColour: toColour(0, 0, 0, 150),
            //textColour: toColour(0, 0, 0, 255),
            transitionTime: 500,
            transitionDelay: 0
        },
        focus : {
            backgroundColour: toColour(0, 0, 0, 150),
            transitionTime: 500,
            transitionDelay: 0
        }*/
    },
    title:
    {
        backgroundColour:	toColour(218, 128, 0, 150),
        textColour:			toColour(0, 0, 0, 200),
        textAlign: 0.5
    }
}

let dashTextStyle = {
    main: {
        textColour: toColour(255, 255, 255, 200),
        textAlign: 0.0,
        textSize: 14.0,
        lineWeight: 2,
        textFont: 'Roboto',
        textAlign: 0.0
        //textAlign: center,
        /*hover: {
            backgroundColour: toColour(255, 255, 255, 150),
            textColour: toColour(0, 0, 0, 255),
            transitionTime: 500,
            transitionDelay: 0,
        }*/
    }
}

let dropDownStyle = {
    main: {
        textColour: toColour(255, 255, 255, 200),
        backgroundColour: toColour(0, 0, 255, 20),
        textAlign: 0.0,
        textSize: 16.0,
        lineWeight: 2,
        textFont: 'Roboto',
        textAlign: 0.0
        //textAlign: center,
        /*hover: {
            backgroundColour: toColour(255, 255, 255, 150),
            textColour: toColour(0, 0, 0, 255),
            transitionTime: 500,
            transitionDelay: 0,
        }*/
    }
}

let joinButtonStyle = {
    main: {
        textColour: toColour(255, 255, 255, 255),
        backgroundColour: toColour(0, 200, 0, 150),
        textAlign: 0.5,
        textSize: 18.0,
        textFont: 'Roboto',
        //textAlign: center,
        hover: {
            backgroundColour: toColour(255, 255, 255, 150),
            textColour: toColour(0, 200, 0, 255),
            transitionTime: 500,
            transitionDelay: 0,
        }
    }
}

let defaultButtonStyle = {
    main: {
        textColour: toColour(255, 255, 255, 255),
        backgroundColour: toColour(0, 255, 0, 50),
        textAlign: 0.5,
        textSize: 14.0,
        textFont: 'Roboto',
        //textAlign: center,
        /*hover: {
            backgroundColour: toColour(255, 255, 255, 150),
            textColour: toColour(0, 200, 0, 255),
            transitionTime: 500,
            transitionDelay: 0,
        }*/
    }
}


let defaultTextStyle = {
    main: {
        textColour: toColour(255, 255, 255, 150),
        textAlign: 0.5,
        textSize: 14.0,
        lineWeight: 1,
        textFont: 'Roboto',
        hover: {
            textColour: toColour(255, 255, 255, 255),
            borderColour: toColour(0, 0, 0, 0),
            transitionTime: 500,
            transitionDelay: 0
        },
        focus : {
            textColour: toColour(255, 255, 255, 255),
            borderColour: toColour(0, 0, 0, 0),
            transitionTime: 500,
            transitionDelay: 0
        }
    }
}
//119, 191, 163, 1
let defaultAcceptButtonStyle = {
    main: {
        textColour: toColour(255, 255, 255, 150),
        backgroundColour: toColour(0, 200, 0, 50),
        textAlign: 0.5,
        textSize: 14.0,
        textFont: 'Roboto',
        hover: {
            textColour:	toColour(255, 255, 255, 255),
            backgroundColour: toColour(0, 200, 0, 100),
            transitionTime: 500,
            transitionDelay: 0
        },
        focus : {
            textColour:	toColour(255, 255, 255, 255),
            backgroundColour: toColour(0, 200, 0, 100),
            transitionTime: 500,
            transitionDelay: 0
        }
    }
}

let defaultDeclineButtonStyle = {
    main: {
        textColour: toColour(255, 255, 255, 150),
        backgroundColour: toColour(255, 0, 0, 50),
        textAlign: 0.5,
        textSize: 14.0,
        textFont: 'Roboto',
        hover: {
            backgroundColour: toColour(255, 0, 0, 100),
            textColour:	toColour(255, 255, 255, 255),
            transitionTime: 500,
            transitionDelay: 0
        },
        focus : {
            backgroundColour: toColour(255, 0, 0, 100),
            textColour:	toColour(0, 0, 0, 255),
            transitionTime: 500,
            transitionDelay: 0
        }
    }
}

let defaultWindowStyle = {
    main: {
        backgroundColour: toColour(0, 0, 0, 80),
        hover: {
            backgroundColour: toColour(0, 0, 0, 100),
            transitionTime: 500,
            transitionDelay: 0
        },
        focus : {
            backgroundColour: toColour(0, 0, 0, 100),
            transitionTime: 500,
            transitionDelay: 0
        }
    },
    title:
    {
        backgroundColour: toColour(218, 128, 0, 150),
        textColour:	toColour(0, 0, 0, 150),
        textAlign: 0.5,
        hover: {
            backgroundColour: toColour(218, 128, 0, 200),
            textColour:	 toColour(0, 0, 0, 255),
            transitionTime: 500,
            transitionDelay: 0
        },
        focus : {
            backgroundColour: toColour(218, 128, 0, 200),
            textColour:	toColour(0, 0, 0, 255),
            transitionTime: 500,
            transitionDelay: 0
        }
    }
}

let textInputStyle = {
    main: {
        textColour: toColour(255, 255, 255, 255),
        backgroundColour: toColour(255, 255, 255, 50),
        textSize: 14.0,
        textFont: 'Roboto',
        hover: {
            borderColour: toColour(0, 0, 0, 0)
            //backgroundColour: toColour(255, 255, 255, 150),
            //textColour: toColour(0, 200, 0, 255),
            //transitionTime: 500,
            //transitionDelay: 0,
        },
        focus : {
            borderColour: toColour(0, 0, 0, 0)
        }
    }
}

