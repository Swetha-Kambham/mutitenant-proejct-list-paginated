using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PSA.DAL.Entities;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("username")]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Column("password")]
    [MaxLength(255)]
    public string Password { get; set; } = string.Empty;

    [Column("role")]
    [MaxLength(50)]
    public string Role { get; set; } = string.Empty;

    [Column("tenant_slug")]
    [MaxLength(50)]
    public string TenantSlug { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<ProjectAccess> ProjectAccesses { get; set; } = new List<ProjectAccess>();
}
