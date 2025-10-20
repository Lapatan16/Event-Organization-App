using eventioBackend.Domain.Entities;
using QRCoder;

namespace eventioBackend.Services
{
    public class QrCodeService
    {
        private readonly SecurityService _securityService;

        public QrCodeService(SecurityService securityService)
        {
            _securityService = securityService;
        }

        public string GenerateQrCodeBase64(string ticketId)
        {
            // generišemo HMAC za ticketId
            var hash = _securityService.GenerateHmac(ticketId);

            // payload koji ide u QR kod
            var payload = $"{ticketId}:{hash}";

            using var qrGenerator = new QRCodeGenerator();
            using var qrData = qrGenerator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);

            var base64QrCode = new Base64QRCode(qrData);
            
            // 20 = pixel-per-module (veličina)
            return base64QrCode.GetGraphic(20);
        }
    }
}
