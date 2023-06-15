'use strict';

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

const dashboardBackgroundStyle = {
	main: {
		backgroundColour: toColour(0, 0, 255, 50),
	},
};

const dashboardLogoStyle = {
	main: {
		textColour: toColour(218, 128, 0, 255),
		textAlign: 0.5,
		textSize: 32.0,
		textFont: 'Pricedown',
	},
	focus: {
		borderColour: toColour(0, 0, 0, 0),
	},
};

const newsTextStyle = {
	main: {
		textColour: toColour(255, 255, 255, 150),
		backgroundColour: toColour(0, 0, 0, 0),
		textAlign: 0.0,
		textSize: 16.0,
		lineWeight: 2,
		textFont: 'Roboto',
	},
	focused: {
		borderColour: toColour(0, 0, 0, 0),
	},
};

const dashboardWindowStyle = {
	main: {
		// backgroundColour: toColour(0, 0, 0, 100),
		backgroundColour: toColour(0, 0, 255, 20),
		// textColour: toColour(255, 255, 255, 255),
		/* hover: {
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
    	textColour:	toColour(0, 0, 0, 200),
    	textAlign: 0.5,
    },
};

const dashTextStyle = {
	main: {
		textColour: toColour(255, 255, 255, 200),
		textAlign: 0.0,
		textSize: 14.0,
		lineWeight: 2,
		textFont: 'Roboto',
		textAlign: 0.0,
		// textAlign: center,
		/* hover: {
            backgroundColour: toColour(255, 255, 255, 150),
            textColour: toColour(0, 0, 0, 255),
            transitionTime: 500,
            transitionDelay: 0,
        }*/
	},
};

const dropDownStyle = {
	main: {
		textColour: toColour(255, 255, 255, 200),
		backgroundColour: toColour(0, 0, 255, 20),
		textAlign: 0.0,
		textSize: 16.0,
		lineWeight: 2,
		textFont: 'Roboto',
		textAlign: 0.0,
		// textAlign: center,
		/* hover: {
            backgroundColour: toColour(255, 255, 255, 150),
            textColour: toColour(0, 0, 0, 255),
            transitionTime: 500,
            transitionDelay: 0,
        }*/
	},
};

const joinButtonStyle = {
	main: {
		textColour: toColour(255, 255, 255, 255),
		backgroundColour: toColour(0, 200, 0, 150),
		textAlign: 0.5,
		textSize: 18.0,
		textFont: 'Roboto',
		// textAlign: center,
		hover: {
			backgroundColour: toColour(255, 255, 255, 150),
			textColour: toColour(0, 200, 0, 255),
			transitionTime: 500,
			transitionDelay: 0,
		},
	},
};

const defaultButtonStyle = {
	main: {
		textColour: toColour(255, 255, 255, 255),
		backgroundColour: toColour(0, 255, 0, 50),
		textAlign: 0.5,
		textSize: 14.0,
		textFont: 'Roboto',
		// textAlign: center,
		/* hover: {
            backgroundColour: toColour(255, 255, 255, 150),
            textColour: toColour(0, 200, 0, 255),
            transitionTime: 500,
            transitionDelay: 0,
        }*/
	},
};


const defaultTextStyle = {
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
			transitionDelay: 0,
		},
		focus: {
			textColour: toColour(255, 255, 255, 255),
			borderColour: toColour(0, 0, 0, 0),
			transitionTime: 500,
			transitionDelay: 0,
		},
	},
};
// 119, 191, 163, 1
const defaultAcceptButtonStyle = {
	main: {
		textColour: toColour(255, 255, 255, 150),
		backgroundColour: toColour(0, 200, 0, 50),
		textAlign: 0.5,
		textSize: 14.0,
		textFont: 'Roboto',
		hover: {
			textColour: toColour(255, 255, 255, 255),
			backgroundColour: toColour(0, 200, 0, 100),
			transitionTime: 500,
			transitionDelay: 0,
		},
		focus: {
			textColour: toColour(255, 255, 255, 255),
			backgroundColour: toColour(0, 200, 0, 100),
			transitionTime: 500,
			transitionDelay: 0,
		},
	},
};

const defaultDeclineButtonStyle = {
	main: {
		textColour: toColour(255, 255, 255, 150),
		backgroundColour: toColour(255, 0, 0, 50),
		textAlign: 0.5,
		textSize: 14.0,
		textFont: 'Roboto',
		hover: {
			backgroundColour: toColour(255, 0, 0, 100),
			textColour: toColour(255, 255, 255, 255),
			transitionTime: 500,
			transitionDelay: 0,
		},
		focus: {
			backgroundColour: toColour(255, 0, 0, 100),
			textColour: toColour(0, 0, 0, 255),
			transitionTime: 500,
			transitionDelay: 0,
		},
	},
};

const defaultWindowStyle = {
	main: {
		backgroundColour: toColour(0, 0, 0, 80),
		hover: {
			backgroundColour: toColour(0, 0, 0, 100),
			transitionTime: 500,
			transitionDelay: 0,
		},
		focus: {
			backgroundColour: toColour(0, 0, 0, 100),
			transitionTime: 500,
			transitionDelay: 0,
		},
	},
	title:
    {
    	backgroundColour: toColour(218, 128, 0, 150),
    	textColour: toColour(0, 0, 0, 150),
    	textAlign: 0.5,
    	hover: {
    		backgroundColour: toColour(218, 128, 0, 200),
    		textColour: toColour(0, 0, 0, 255),
    		transitionTime: 500,
    		transitionDelay: 0,
    	},
    	focus: {
    		backgroundColour: toColour(218, 128, 0, 200),
    		textColour: toColour(0, 0, 0, 255),
    		transitionTime: 500,
    		transitionDelay: 0,
    	},
    },
};

const textInputStyle = {
	main: {
		textColour: toColour(255, 255, 255, 255),
		backgroundColour: toColour(255, 255, 255, 50),
		textSize: 14.0,
		textFont: 'Roboto',
		hover: {
			borderColour: toColour(0, 0, 0, 0),
			// backgroundColour: toColour(255, 255, 255, 150),
			// textColour: toColour(0, 200, 0, 255),
			// transitionTime: 500,
			// transitionDelay: 0,
		},
		focus: {
			borderColour: toColour(0, 0, 0, 0),
		},
	},
};

