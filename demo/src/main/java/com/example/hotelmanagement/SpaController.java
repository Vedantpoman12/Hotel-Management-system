package com.example.hotelmanagement;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {
    @RequestMapping(value = { "/", "/admin/**", "/bookings/**" })
    public String redirect() {
        return "forward:/index.html";
    }
}
