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
        t = t - Math.floor(t);      //dont get this either

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
let vertex_arr = [new Vertex(new Vec2d(830,214))   , new Vertex(new Vec2d(968,589))  , new Vertex(new Vec2d(606,606))  ,new Vertex(new Vec2d(673,219)) ];
//=========== Dragging Vertex with mouse Logic (to be reused in the future )===========================================================//
let mousePoint = new Vec2d(0,0);
let isDragging = false;
let dragOffset = new Vec2d(0,0);
let selected_vertex = null;


let curve = new Spline(vertex_arr, true, 0.001);  //FUTURE : make it so that vec2d array can be extracted instead of using the vertex array


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
                  
            curve.calculate_curve_points(); //recalculate everyframe

              //draw them vertex
              for(let i=0; i<vertex_arr.length;i++)
              {
                FillCircle(vertex_arr[i].position,1,"red");
                DrawCircle(vertex_arr[i].position,vertex_arr[i].radius,point_checker_circle(mousePoint,vertex_arr[i].position,vertex_arr[i].radius)?"yellow":"red");
              }
             
              //Draw the curve points
                for(let i=0; i<curve.curve_points.length;i++)
                {   
                    FillCircle(curve.curve_points[i], 2 , "white");
                }
                console.log(vertex_arr);

    }

    
    Loop();
    