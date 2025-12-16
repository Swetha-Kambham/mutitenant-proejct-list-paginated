using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PSA.DAL.Entities;

[Table("project_access")]
public class ProjectAccess
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("project_id")]
    public int ProjectId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    [ForeignKey(nameof(ProjectId))]
    public virtual Project Project { get; set; } = null!;

    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
}
