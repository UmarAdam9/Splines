let msPrev = window.performance.now();
const fps = 60;
const msPerFrame = 1000 / fps;


class Vertex{
    constructor(pos, r=10){
        this.position = pos;
        this.radius = r;
    }
}
class Spline{
    constructor(p, loop = false, d = 0.01){
        this.points = p;
        this.curve_points=[];
        this.delta = d;
        this.isLooped = loop;
    }
    getSplinePoint(t){

        let p0,p1,p2,p3;

      if(!this.isLooped)
      {
        p1 = Math.floor(t)+1;       //still dont *quite* get this
        p2 = p1+1;
        p3 = p2+1;
        p0 = p1-1;
      }
      else{
        p1 = Math.floor(t);       //still dont *quite* get this
        p2 = (p1+1) % this.points.length;
        p3 = (p2+1) % this.points.length;
        p0 = p1>=1 ? p1-1 : this.points.length -1;
      }
        t = t - Math.floor(t);      

        //console.log(p0,p1,p2,p3);
        

        let tt = t*t;
        let ttt = tt*t;

        let q1 = -ttt + 2.0*tt -t;
        let q2 = 3.0*ttt - 5.0*tt +2.0;
        let q3 = -3.0*ttt + 4.0*tt +t;
        let q4 = ttt-tt;

        let tx = 0.5 * (this.points[p0].position.x*q1 + this.points[p1].position.x*q2 +this.points[p2].position.x*q3 + this.points[p3].position.x*q4);
        let ty = 0.5 * (this.points[p0].position.y*q1 + this.points[p1].position.y*q2 +this.points[p2].position.y*q3 + this.points[p3].position.y*q4);

        return new Vec2d(tx,ty);
    }

     getSplineGradient(t){

        let p0,p1,p2,p3;

      if(!this.isLooped)
      {
        p1 = Math.floor(t)+1;       //still dont *quite* get this
        p2 = p1+1;
        p3 = p2+1;
        p0 = p1-1;
      }
      else{
        p1 = Math.floor(t);       //still dont *quite* get this
        p2 = (p1+1) % this.points.length;
        p3 = (p2+1) % this.points.length;
        p0 = p1>=1 ? p1-1 : this.points.length -1;
      }
        t = t - Math.floor(t);      //dont get this either

        //console.log(p0,p1,p2,p3);
        

        let tt = t*t;
        let ttt = tt*t;

        let q1 = -3.0*tt + 4.0*t -1.0;
        let q2 = 9.0*tt - 10.0*t;
        let q3 = -9.0*tt + 8.0*t +1.0;
        let q4 = 3.0*tt-2.0*t;

        let tx = 0.5 * (this.points[p0].position.x*q1 + this.points[p1].position.x*q2 +this.points[p2].position.x*q3 + this.points[p3].position.x*q4);
        let ty = 0.5 * (this.points[p0].position.y*q1 + this.points[p1].position.y*q2 +this.points[p2].position.y*q3 + this.points[p3].position.y*q4);

        return new Vec2d(tx,ty);
    }

    calculate_curve_points()
    {
      this.curve_points.length = 0;
      if(!this.isLooped)
      {
          for(let t = 0; t < this.points.length-3.0 ; t+=this.delta)
         {
          this.curve_points.push(this.getSplinePoint(t));
         }

      }

      else
      {
        for(let t = 0; t < this.points.length ; t+=this.delta)
         {
          this.curve_points.push(this.getSplinePoint(t));
         }
      }
    }
}

/*
====Note on how to use the Spline Object=====

  1.create a Spline object and pass to it a vector of Vertex Objects (vertex have position and a circular bound around the point for interaction purposes ).
  2.Once the spline object is created , it can be "traversed" by interrogating it with a parameter "t" and it will output a 2D point on the spline curve.
  3.  [for looped spline]
        The parameter "t" is bounded by the number of vertex points the spline was made from (e.g if a spline was made by 8 vertex points, the parameter t can be from 0 to 7) 
      [for unlooped spline]
        from 0 to vertex points.length - 3 (still dont really understand why)
  4.  To animate a polygon on the spline
      i. create the spline and the polygon (duh)
      ii.create a "traversal" variable that can have a value between (zero) and (spline points array length -1)
      iii.pass the "traversal" variable to the getSplinePoint function to get a Vec2d position and assign that position to the polygon everyframe
      iv. incrementing and decrementing the "traversal" variable will animate the polygon around the spline
      v.  the polygon can be oriented on the curve by interrogating the curve for gadient at that point (using the getSplineGradient method) an using that to rotate the polygon as it moves around the curve.
 ================================================
      */

//starting vertices for the spline
let vertex_arr = [new Vertex(new Vec2d(830,214))   , new Vertex(new Vec2d(968,589))  , new Vertex(new Vec2d(606,606))  ,new Vertex(new Vec2d(673,219)) ];

//model stuff
let traversal_var=0;
let model_pos  = new Vec2d(0,0);
let model_grad = new Vec2d(0,0);
let scale = 50;
let model_verts = [
  new Vec2d(-scale,-scale/2),
  new Vec2d(-scale, scale/2),
  new Vec2d(scale/2,scale/2),
  new Vec2d(scale/2,scale),
  new Vec2d(scale,0),
  new Vec2d(scale/2,-scale),
  new Vec2d(scale/2,-scale/2),
]

//=========== Dragging Vertex with mouse Logic (to be reused in the future )===========================================================//
let mousePoint = new Vec2d(0,0);
let isDragging = false;
let dragOffset = new Vec2d(0,0);
let selected_vertex = null;


let curve = new Spline(vertex_arr, true, 0.01);  //FUTURE : make it so that vec2d array can be extracted instead of using the vertex array


// Mouse down
canvas.addEventListener("mousedown", (e) => {

  //iterate through the points
  for(let i=0; i<vertex_arr.length;i++)
    {
        if (point_checker_circle(mousePoint, vertex_arr[i].position, vertex_arr[i].radius)) 
        {
            isDragging = true;
            dragOffset = vec_sub(mousePoint , vertex_arr[i].position);
            selected_vertex = vertex_arr[i];
            console.log("dragging set");
            return;
        }
    }
     //else spawn a new vertex
        vertex_arr.splice(vertex_arr.length -1 , 0, new Vertex(new Vec2d(mousePoint.x,mousePoint.y)));


});
//mousemove (updates the global mousePoint variable as well as handles the dragging logic)
 canvas.addEventListener("mousemove", (e) => {
    mousePoint.x= e.clientX;
    mousePoint.y= e.clientY;
    if (isDragging ) {
     
        //calculate the delta
        let delta = vec_sub(mousePoint , dragOffset);
       // selected_vertex.position = vec_sub(mousePoint,delta); //i think this needs to be integrated but leaving for now  
       //selected_vertex.position = mousePoint; //this passes by reference as both are objects instead see the next line
       selected_vertex.position = new Vec2d(mousePoint.x, mousePoint.y); 
        console.log("currently dragging");
    }
});
// Mouse up
canvas.addEventListener("mouseup", () => {
  isDragging = false;
  selected_vertex= null;
  console.log("dragging finished");
});


//======================================================================================================================================//


function Loop(){

    animationID = requestAnimationFrame(Loop);
    
         //=======handle timing===================//
        let msNow = window.performance.now();
        let dt = msNow - msPrev;
    
        if(dt < msPerFrame) return
        let excessTime = dt % msPerFrame
        msPrev = msNow - excessTime
        msPrev = msNow;
        dt=dt/1000;
       
       //==========================================//
        
       
        //clear screen
            ctx.beginPath();
            ctx.fillStyle = "orange";
            ctx.fillRect(0,0,canvas.width ,canvas.height);
                  
            traversal_var < curve.points.length - 0.01 ? traversal_var+=0.01 : traversal_var=0; //keep the model going
            curve.calculate_curve_points(); //recalculate everyframe
            model_pos = curve.getSplinePoint(traversal_var); //get the position on the curve for the model
            model_grad = curve.getSplineGradient(traversal_var); //get the gradient on that particular point on curve
           




                //For Debugging
                //Draw the gradient at every control point
                  for(let i=0; i<curve.points.length;i+=0.5)
                {   
                   //get point
                   let p = curve.getSplinePoint(i);
                  DrawCircle(p,10,"purple");
                   console.log(p);
                   
                    //get gradient
                    let g = curve.getSplineGradient(i);
                    g = vec_normalise(g);
                     g = vec_multiply(g,100);
                     console.log(g);
                     
                    DrawLine(p,vec_add(p,g),"red");
                }




                 //Draw the curve points
                for(let i=0; i<curve.curve_points.length;i++)
                {   
                    FillCircle(curve.curve_points[i], 2 , "white");
                }

                //draw them vertex
                for(let i=0; i<vertex_arr.length;i++)
                {
                  FillCircle(vertex_arr[i].position,1,"red");
                  DrawCircle(vertex_arr[i].position,vertex_arr[i].radius,point_checker_circle(mousePoint,vertex_arr[i].position,vertex_arr[i].radius)?"yellow":"red");
                }
             
             

               //Draw the model

               //translate based on model_pos and rotate based on model_grad
                 model_grad = vec_normalise(model_grad);
                 let r = Math.atan2(model_grad.y,model_grad.x);

                for(let i=0 ; i<model_verts.length;i++)
                {
                  //DrawLine(vec_add( model_verts[i], model_pos) , vec_add( model_verts[(i+1) % model_verts.length], model_pos) ,"#0066cc" );

                  DrawLine(new Vec2d( (model_verts[i].x * Math.cos(r) - model_verts[i].y * Math.sin(r) )+  model_pos.x ,                                                         (model_verts[i].x * Math.sin(r) + model_verts[i].y * Math.cos(r) )+  model_pos.y  ) ,
                           new Vec2d( (model_verts[(i+1) % model_verts.length].x * Math.cos(r) - model_verts[(i+1) % model_verts.length].y * Math.sin(r) ) +  model_pos.x ,      (model_verts[(i+1) % model_verts.length].x * Math.sin(r) + model_verts[(i+1) % model_verts.length].y * Math.cos(r) ) +  model_pos.y  ) ,

                        "#0066cc" );
                }
            
              
                
               
               

    }

    
    Loop();
    