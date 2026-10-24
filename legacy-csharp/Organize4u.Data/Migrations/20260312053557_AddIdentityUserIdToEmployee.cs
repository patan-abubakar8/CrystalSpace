using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Organize4u.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIdentityUserIdToEmployee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IdentityUserId",
                table: "Employees",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdentityUserId",
                table: "Employees");
        }
    }
}
