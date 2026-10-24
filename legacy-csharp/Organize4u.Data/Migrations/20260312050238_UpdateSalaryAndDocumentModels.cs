using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Organize4u.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSalaryAndDocumentModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "IncrementDate",
                table: "Salaries",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "IncrementPercentage",
                table: "Salaries",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "FileSize",
                table: "EmployeeDocuments",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IncrementDate",
                table: "Salaries");

            migrationBuilder.DropColumn(
                name: "IncrementPercentage",
                table: "Salaries");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "EmployeeDocuments");
        }
    }
}
