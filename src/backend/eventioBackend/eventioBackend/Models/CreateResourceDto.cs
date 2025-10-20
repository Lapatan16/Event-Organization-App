
namespace eventioBackend.DTOs
{
  public class CreateResourceDto
  {
    
    public string Name { get; set; }
    public string Type { get; set; }
    public string Contact { get; set; }
    public string Description { get; set; }
    public string Adress { get; set; }
    public string City { get; set; }
     public DateTime CreatedAt { get; set; } 
    
  }
}