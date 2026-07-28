"""
TenantQueryMixin: automatically scopes querysets to the active tenant.
Provides methods for querying tenant-specific data.

Every view that handles org-scoped resources inherits this mixin.
It enforces that no engineer can accidentally forget to filter by tenant.
"""

import logging
from rest_framework.exceptions import NotFound

logger = logging.getLogger(__name__)


class TenantQuerysetMixin:
    """
    Mixin that scopes every querysets to request.org.

    Subclasses must implement get_base_queryset() instead of get_queryset() to provide the base queryset.
    This mixin adds the org filter automatically.
    """
    def get_queryset(self):
        """
        Override get_queryset to filter by the active organisation.
        Raises NotFound if no organisation is found in the request.
        """
        if getattr(self, 'swagger_fake_view', False):
            model = self.serializer_class.Meta.model
            return model.objects.none()
        
        org = getattr(self.request, 'org', None)
        if not org:
            logger.debug("No organisation found in request")
            raise NotFound("Organisation not found.")
        
        queryset = self.get_base_queryset(self)
        return queryset.filter(organisation=org)
    
    def get_base_queryset(self):
        """
        Subclasses must implement this method to provide the base queryset.
        """
        raise NotImplementedError(
            f"{self.__class__.__name__} must implement get_base_queryset()"
        )
    
    def perform_create(self, serializer):
        """
        Override perform_create to automatically set the organisation on new objects.
        """        
        serializer.save(organisation=self.request.org)
