output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.web.public_ip
}

output "app_url" {
  description = "Full URL of the deployed application"
  value       = "http://${aws_instance.web.public_ip}"
}

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.web.id
}