# IMGD_CS_4300_A3

I wanted to make my interactive shader with only the video. All other shapes and colors were limited. Instead I manipulated how the video was shaped and placed on the screen. My final product has two main components. 

The first component warps the screen. Given the two points, p1 = (x1, y1) and p2 = (x2, y2), the warp function bends p1 to p2. There are five sliders used in this component. Four sliders allow the user to control the x and y values and the last slider controls the radius of the warp. This creates an interesting funhouse mirror effect that can be manipulated by the user. 

The second component of my interactive shader adds cellular noise. This is the classic Worley noise that splits the screen into a grid of cells. A point is placed in a random position in each cell, and a distance field is created around each point. I replaced every distance field with the video feed. A slider is used to scale the grid, adding more cells. Changing this in real time creates a kaleidoscope like effect. 
