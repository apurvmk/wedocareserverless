{
  "Resources": {
    "EC2WeDOcare": {
      "Type": "AWS::EC2::Instance",
      "Properties" : {
        "ImageId" : "ami-6869aa05",
        "InstanceType" : "t2.micro",
        "KeyName" : "wedocare",
        "SecurityGroups" : [ "wedocare"]
      }
    }
  }
}
