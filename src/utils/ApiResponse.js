class ApiResponse{

    constructor(statuscode,message="Success",data){
        this.data = data 
        this.statuscode = statuscode;
        this.message = message;
        this.status = statuscode < 400;
    }
}