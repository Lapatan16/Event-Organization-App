
namespace eventioBackend.DTOs
{
  public class ResourceDto
  {
     public string Id { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public string Contact { get; set; }
    public string Description { get; set; }
    public string Adress { get; set; }
    public string City { get; set; }
     public DateTime CreatedAt { get; set; } 
      //  public int Quantity { get; set; }
  }
}