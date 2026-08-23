variable "aws_region" {
  description = "AWS region to deploy too"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type — t2.micro is free tier"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Name of the SSH key pair in AWS"
  type        = string
  default     = "devops-key"
}