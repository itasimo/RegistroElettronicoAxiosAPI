-----------------------------------------------------------------------------------------------
LA CARTELLA PNG CONTIENE LE ICONE DI jQuery Mobile Icon Pack
-----------------------------------------------------------------------------------------------
http://andymatthews.net/code/jquery-mobile-icon-pack/

Extending 

Centered Icons

Every jQuery Mobile app is slightly different. In many cases sizes, and positions, of icons are also different. To that end I've intentionally not applied any sort of alignment or positioning of the icons contained within Icon Pack. This means that in the demos some of the icons might be centered, some of them might be aligned to the left. This is by design (at least for the time being).

If you need to adjust the position of icons in your implementation, here's how you do it. In your CSS, for the icon you'd like to position, add a background-position declaration. Here's an example for the adjust icon:

.ui-icon-adjust:after {
    background-image: url("<url removed for brevity>");
    background-repeat: no-repeat;
    background-position: 4px 3px;
}


-----------------------------------------------------------------------------------------------
ICONE da 
-----------------------------------------------------------------------------------------------
- Regole:
	Dimensioni			Padding							Colore
	100					15%	(se già non presente) 		#8f8f8f (grigio) 
	50					5%			 "					   "
	25					0%								A limite a colori


- Rinominate:

User Male-100						User-100
Appointment Reminders-100			Notify-100
Password 1-100						OTP-100
QR Code Filled-100					QR Code-100
Curriculum-100						InOut-100
Report-card-100						Justify-100

Syncronize-50						Syncronize Success-50
Syncronize-50						Syncronize Fail-50
Virtual Machine 2-50				Application-50
Windows Client-50					System-50
Planner-50							Calendar-50

Offline Filled-25					Offline User-25
Attach Filled-20					Attach-20
Checked Filled-20					Checked-20

