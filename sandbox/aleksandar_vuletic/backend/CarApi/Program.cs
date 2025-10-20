using CarApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Dodaj CarService kao singleton da bude dostupan u DI kontejneru
builder.Services.AddSingleton<CarService>();

builder.Services.AddControllers();

// Omogući Swagger za API dokumentaciju i testiranje
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Omogući CORS za sve origin-e (za razvoj i testiranje sa frontenda)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();