from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import EnquiryCreateSerializer


class EnquiryCreateView(generics.CreateAPIView):
    serializer_class = EnquiryCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {'success': True, 'message': 'Enquiry submitted successfully.'},
            status=status.HTTP_201_CREATED
        )
