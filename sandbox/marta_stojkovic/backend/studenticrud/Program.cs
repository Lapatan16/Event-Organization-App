using studenticrud.Services;
using studenticrud.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<studentiService>();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy
                .AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader());
    options.AddDefaultPolicy(policy =>
                    policy.WithOrigins("http://localhost:5285")
                          .AllowAnyHeader()
                          .AllowAnyMethod());

        
});


builder.Services.Configure<StudentiDatabaseSettings>(
    builder.Configuration.GetSection("studentiDatabaseSettings"));



var app = builder.Build();


     if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

app.UseCors();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();


app.Run();
//5285
